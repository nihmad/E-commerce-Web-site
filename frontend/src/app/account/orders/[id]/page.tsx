"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
};

type Order = {
  id: number;
  status: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  cancelled: "Annulée",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await apiFetch(`/api/orders/my-orders/${id}/`);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Commande introuvable.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <main className="p-8">Chargement...</main>;

  if (error || !order) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/account/orders" className="text-blue-600 underline">
          Retour aux commandes
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-2xl mx-auto py-10 px-4">
        <Link
          href="/account/orders"
          className="text-blue-600 text-sm hover:underline"
        >
          &larr; Mes commandes
        </Link>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Commande #{order.id}</h1>
            <span
              className={`text-sm font-medium px-3 py-1 rounded ${
                order.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : order.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <p className="text-gray-500 mb-6">
            Passée le{" "}
            {new Date(order.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          <h2 className="font-semibold mb-3">Articles</h2>
          <ul className="space-y-3 mb-6">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <span>
                  {item.product_name} x{item.quantity}
                </span>
                <span>
                  {(parseFloat(item.unit_price) * item.quantity).toFixed(2)} &euro;
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold text-green-700">
              {order.total_amount} &euro;
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
