"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, apiFetch } from "@/lib/api";
import { getCart, clearCart, cartTotal, CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresSignin, setRequiresSignin] = useState(false);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const total = cartTotal(cart);

  async function handleCheckout() {
    setError(null);
    setRequiresSignin(false);
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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const needsSignin = err.status === 401;
        setRequiresSignin(needsSignin);
        setError(needsSignin ? "Veuillez vous connecter pour continuer." : err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la creation de la session de paiement.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="page-shell">
        <section className="page-container max-w-2xl">
          <h1 className="section-title-serif text-3xl mb-4">Paiement</h1>
          <p className="text-gray-500 mb-4">Votre panier est vide.</p>
          <Link href="/" className="text-[#8d6a34] hover:underline">
            Retour a la boutique
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-container max-w-2xl">
        <h1 className="section-title-serif text-3xl mb-6">Recapitulatif de commande</h1>

        <div className="surface-card-luxury p-6 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {item.price} EUR
                </p>
              </div>
              <p className="font-semibold text-[#9a7b49]">
                {(parseFloat(item.price) * item.quantity).toFixed(2)} EUR
              </p>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <p className="text-lg font-bold">Total</p>
            <p className="text-lg font-semibold text-[#9a7b49]">
              {total.toFixed(2)} EUR
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4">
            {requiresSignin ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Connexion requise
                </p>
                <p className="text-sm text-amber-800 mt-1">{error}</p>
                <Link href="/auth/signin" className="btn-primary inline-block mt-3">
                  Se connecter pour continuer
                </Link>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  Paiement indisponible
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="mt-6 w-full btn-gold py-3 text-base disabled:opacity-60"
        >
          {loading ? "Redirection vers Stripe..." : "Payer avec Stripe"}
        </button>
      </section>
    </main>
  );
}
