from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, SupportMessage, SupportTicket
from .serializers import OrderSerializer, SupportTicketSerializer


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderSupportTicketView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_order(self, user, order_id: int):
        try:
            return Order.objects.get(pk=order_id, user=user)
        except Order.DoesNotExist:
            return None

    def get(self, request, order_id: int, *args, **kwargs):
        order = self.get_order(request.user, order_id)
        if not order:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        ticket = SupportTicket.objects.filter(order=order, user=request.user).first()
        if not ticket:
            return Response({"detail": "Aucun ticket SAV pour cette commande."}, status=status.HTTP_404_NOT_FOUND)

        return Response(SupportTicketSerializer(ticket).data)

    def post(self, request, order_id: int, *args, **kwargs):
        order = self.get_order(request.user, order_id)
        if not order:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"detail": "Le message est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

        ticket, _ = SupportTicket.objects.get_or_create(order=order, user=request.user)
        SupportMessage.objects.create(ticket=ticket, sender=request.user, content=message)
        ticket.save(update_fields=["updated_at"])

        return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
