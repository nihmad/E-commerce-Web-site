"use client";

import { FormEvent, useEffect, useState } from "react";
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

type SupportMessage = {
  id: number;
  sender_email: string;
  content: string;
  created_at: string;
};

type SupportTicket = {
  id: number;
  status: string;
  created_at: string;
  updated_at: string;
  messages: SupportMessage[];
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

const ORDER_STEPS = [
  { key: "processing", label: "En cours de traitement" },
  { key: "shipped", label: "Expediee" },
  { key: "out_for_delivery", label: "En cours de livraison" },
  { key: "delivered", label: "Livree" },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState<string | null>(null);
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
      } catch (err: unknown) {
        if (err instanceof ApiError || err instanceof Error) {
          setError(err.message);
        } else {
          setError("Commande introuvable.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function loadSupport() {
      try {
        const data = await apiFetch(`/api/orders/my-orders/${id}/support/`);
        setTicket(data);
      } catch {
        setTicket(null);
      }
    }
    loadSupport();
  }, [id]);

  async function handleSupportSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id || !supportMessage.trim()) return;
    setSupportFeedback(null);
    setSupportLoading(true);
    try {
      const data = await apiFetch(`/api/orders/my-orders/${id}/support/`, {
        method: "POST",
        body: JSON.stringify({ message: supportMessage.trim() }),
      });
      setTicket(data);
      setSupportMessage("");
      setSupportFeedback("Message envoye au SAV.");
    } catch (err: unknown) {
      if (err instanceof ApiError || err instanceof Error) {
        setSupportFeedback(err.message);
      } else {
        setSupportFeedback("Impossible d'envoyer le message au SAV.");
      }
    } finally {
      setSupportLoading(false);
    }
  }

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

  const currentStep =
    order.status === "paid"
      ? 0
      : ORDER_STEPS.findIndex((step) => step.key === order.status);

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
            <h1 className="text-2xl font-bold">Commande client #{order.user_order_number}</h1>
            <span
              className={`text-sm font-medium px-3 py-1 rounded ${
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

          <div className="mt-8 pt-6 border-t">
            <h2 className="font-semibold mb-3">Suivi de commande</h2>
            {order.status === "pending" && (
              <p className="text-sm text-amber-700 mb-3">
                Paiement en attente de confirmation.
              </p>
            )}
            {order.status === "cancelled" && (
              <p className="text-sm text-red-700 mb-3">
                Cette commande a ete annulee.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {ORDER_STEPS.map((step, index) => {
                const done = currentStep >= index;
                return (
                  <div
                    key={step.key}
                    className={`rounded border px-3 py-2 text-xs font-medium ${
                      done
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    {step.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h2 className="font-semibold mb-3">Support SAV</h2>
            <p className="text-sm text-gray-600 mb-4">
              Un probleme avec cette commande ? Ecris au SAV directement ici.
            </p>

            {ticket && ticket.messages.length > 0 && (
              <div className="space-y-2 mb-4">
                {ticket.messages.map((message) => (
                  <div key={message.id} className="bg-gray-50 border rounded p-3">
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.sender_email} ·{" "}
                      {new Date(message.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="input-field min-h-24"
                placeholder="Decris ton probleme de commande..."
                required
              />
              <button
                type="submit"
                disabled={supportLoading}
                className="btn-primary disabled:opacity-60"
              >
                {supportLoading ? "Envoi..." : "Contacter le SAV"}
              </button>
            </form>

            {supportFeedback && (
              <p className="text-sm mt-3 text-slate-700">{supportFeedback}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
