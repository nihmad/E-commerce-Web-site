from django.urls import path

from .views import MyOrdersView, OrderDetailView

urlpatterns = [
    path("my-orders/", MyOrdersView.as_view(), name="my-orders"),
    path("my-orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
]

