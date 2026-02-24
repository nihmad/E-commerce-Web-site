"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getCart, clearCart, cartTotal, CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cartTotal(cart);

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const items = cart.map((c) => ({
        product_id: c.productId,
        quantity: c.quantity,
      }));
      const data = await apiFetch("/api/payments/checkout-session/", {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      if (data.checkout_url) {
        clearCart();
        window.location.href = data.checkout_url;
      }
    } catch (err: any) {
      setError(
        err.message || "Erreur lors de la création de la session de paiement."
      );
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Paiement</h1>
        <p className="text-gray-500 mb-4">Votre panier est vide.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Retour à la boutique
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Récapitulatif de commande</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {item.price} &euro;
                </p>
              </div>
              <p className="font-bold">
                {(parseFloat(item.price) * item.quantity).toFixed(2)} &euro;
              </p>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-bold">Total</p>
            <p className="text-lg font-bold text-green-700">
              {total.toFixed(2)} &euro;
            </p>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded text-base font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Redirection vers Stripe..." : "Payer avec Stripe"}
        </button>
      </section>
    </main>
  );
}
