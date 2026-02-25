from django.contrib import admin

from .models import Order, OrderItem, SupportMessage, SupportTicket


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "unit_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "total_amount", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "stripe_payment_intent")
    inlines = [OrderItemInline]


class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 1
    readonly_fields = ("created_at",)


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "user", "status", "updated_at")
    list_filter = ("status", "updated_at")
    search_fields = ("order__id", "user__email")
    inlines = [SupportMessageInline]
