from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import CreateCheckoutSessionView, StripeWebhookView

urlpatterns = [
    path("checkout-session/", CreateCheckoutSessionView.as_view(), name="checkout-session"),
    path("webhook/", csrf_exempt(StripeWebhookView.as_view()), name="stripe-webhook"),
]

