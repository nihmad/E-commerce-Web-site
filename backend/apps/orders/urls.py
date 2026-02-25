from django.urls import path

from .views import MyOrdersView, OrderDetailView, OrderSupportTicketView

urlpatterns = [
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("my-orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("my-orders/<int:order_id>/support/", OrderSupportTicketView.as_view(), name="order-support"),
]

