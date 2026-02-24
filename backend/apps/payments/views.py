from decimal import Decimal

import stripe
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.orders.models import Order, OrderItem
from .models import Payment

FRONTEND_URL = "http://localhost:3000"


class CreateCheckoutSessionView(APIView):
    """
    Crée une commande + une session de paiement Stripe à partir d'un panier.
    Body attendu : { "items": [{"product_id": 1, "quantity": 2}, ...] }
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        stripe.api_key = settings.STRIPE_API_KEY

        items = request.data.get("items", [])
        if not items:
            return Response(
                {"detail": "Aucun article fourni."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = Order.objects.create(user=request.user)
        line_items = []
        total = Decimal("0.00")

        for item in items:
            product_id = item.get("product_id")
            quantity = int(item.get("quantity", 1))
            if quantity <= 0:
                continue
            try:
                product = Product.objects.get(pk=product_id, is_active=True)
            except Product.DoesNotExist:
                continue

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.price,
            )
            total += product.price * quantity

            line_items.append(
                {
                    "price_data": {
                        "currency": "eur",
                        "product_data": {"name": product.name},
                        "unit_amount": int(product.price * 100),
                    },
                    "quantity": quantity,
                }
            )

        if not line_items:
            order.delete()
            return Response(
                {"detail": "Panier invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.total_amount = total
        order.save()

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=line_items,
            success_url=f"{FRONTEND_URL}/success?order_id={order.id}",
            cancel_url=f"{FRONTEND_URL}/cancel",
            metadata={"order_id": order.id},
        )

        order.stripe_payment_intent = session.payment_intent or ""
        order.save(update_fields=["stripe_payment_intent"])

        if session.payment_intent:
            Payment.objects.create(
                order=order,
                stripe_payment_intent=session.payment_intent,
                amount=total,
                currency="eur",
            )

        return Response({"checkout_url": session.url}, status=status.HTTP_201_CREATED)


class StripeWebhookView(APIView):
    """
    Reçoit les événements Stripe (checkout.session.completed, payment_intent.succeeded).
    Vérifie la signature, puis met à jour le statut de la commande.
    """

    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        stripe.api_key = settings.STRIPE_API_KEY
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except stripe.error.SignatureVerificationError:
            return Response(
                {"detail": "Signature invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        event_type = event["type"]
        data_object = event["data"]["object"]

        if event_type == "checkout.session.completed":
            order_id = data_object.get("metadata", {}).get("order_id")
            payment_intent_id = data_object.get("payment_intent", "")

            if order_id:
                try:
                    order = Order.objects.get(pk=order_id)
                    order.status = "paid"
                    order.stripe_payment_intent = payment_intent_id or order.stripe_payment_intent
                    order.save(update_fields=["status", "stripe_payment_intent"])

                    Payment.objects.update_or_create(
                        order=order,
                        defaults={
                            "stripe_payment_intent": payment_intent_id,
                            "amount": order.total_amount,
                            "currency": "eur",
                        },
                    )
                except Order.DoesNotExist:
                    pass

        elif event_type == "payment_intent.succeeded":
            payment_intent_id = data_object["id"]
            try:
                payment = Payment.objects.get(stripe_payment_intent=payment_intent_id)
                order = payment.order
                if order.status != "paid":
                    order.status = "paid"
                    order.save(update_fields=["status"])
            except Payment.DoesNotExist:
                pass

        return Response(status=status.HTTP_200_OK)

