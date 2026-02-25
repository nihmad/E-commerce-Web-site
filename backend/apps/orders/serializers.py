from rest_framework import serializers

from .models import Order, OrderItem, SupportMessage, SupportTicket


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product_name", "quantity", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_order_number = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id", "user_order_number", "status", "total_amount", "created_at", "items"]

    def get_user_order_number(self, obj: Order) -> int:
        return (
            Order.objects.filter(user=obj.user, created_at__lt=obj.created_at).count() + 1
        )


class SupportMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source="sender.email", read_only=True)

    class Meta:
        model = SupportMessage
        fields = ["id", "sender_email", "content", "created_at"]


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = ["id", "status", "created_at", "updated_at", "messages"]
