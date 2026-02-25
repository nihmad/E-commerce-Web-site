"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, apiFetch } from "@/lib/api";

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
};

type Order = {
  id: number;
  user_order_number: number;
  status: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Paiement confirme",
  processing: "En cours de traitement",
  shipped: "Expediee",
  out_for_delivery: "En cours de livraison",
  delivered: "Livree",
  cancelled: "Annulée",
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/api/orders/my-orders/");
        setOrders(data);
      } catch (err: unknown) {
        if (err instanceof ApiError || err instanceof Error) {
          setError(err.message);
        } else {
          setError("Impossible de charger vos commandes.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <main className="page-shell page-container">Chargement...</main>;

  if (error) {
    return (
      <main className="page-shell page-container max-w-xl">
        <p className="text-red-600 bg-red-50 border border-red-100 rounded p-3 mb-3">{error}</p>
        <Link href="/auth/signin" className="text-blue-600 underline">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-container max-w-3xl">
        <Link
          href="/account"
          className="text-blue-600 text-sm hover:underline"
        >
          &larr; Mon compte
        </Link>
        <h1 className="section-title mt-4 mb-6">Mes commandes</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">Aucune commande pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="surface-card block p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    Commande client #{order.user_order_number}
                  </span>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "shipped" || order.status === "out_for_delivery"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(order.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <ul className="text-sm space-y-1 mb-2">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.product_name} x{item.quantity} &mdash;{" "}
                      {item.unit_price} &euro;
                    </li>
                  ))}
                </ul>
                <p className="font-bold text-right">
                  Total : {order.total_amount} &euro;
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
