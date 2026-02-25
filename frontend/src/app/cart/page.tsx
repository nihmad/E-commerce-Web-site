"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartItem,
  getCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  cartTotal,
} from "@/lib/cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    return getCart();
  });

  function reload() {
    setCart(getCart());
  }

  useEffect(() => {
    window.addEventListener("cart-updated", reload);
    return () => window.removeEventListener("cart-updated", reload);
  }, []);

  const total = cartTotal(cart);

  if (cart.length === 0) {
    return (
      <main className="page-shell">
        <section className="page-container max-w-3xl">
          <h1 className="section-title-serif text-3xl mb-4">Mon panier</h1>
          <p className="text-gray-500 mb-4">Votre panier est vide.</p>
          <Link href="/" className="text-[#8d6a34] hover:underline">
            Parcourir les categories
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-container max-w-3xl">
        <h1 className="section-title-serif text-3xl mb-6">Mon panier</h1>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="surface-card-luxury flex items-center gap-4 p-4"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-semibold hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-[#9a7b49] font-semibold">{item.price} EUR</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="w-8 h-8 rounded border text-lg leading-none hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  disabled={item.quantity >= item.stock}
                  className="w-8 h-8 rounded border text-lg leading-none hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="text-red-500 text-sm hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>

        {cart.some((item) => item.quantity >= item.stock) && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded p-3 mt-4">
            Certaines quantites ont atteint le stock maximum disponible.
          </p>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => clearCart()}
            className="btn-danger text-sm"
          >
            Vider le panier
          </button>
          <div className="text-right">
            <p className="text-xl font-bold">
              Total : {total.toFixed(2)} EUR
            </p>
            <Link
              href="/checkout"
              className="inline-block mt-3 btn-gold"
            >
              Passer au paiement
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
