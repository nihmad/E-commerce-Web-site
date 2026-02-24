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
  const [cart, setCart] = useState<CartItem[]>([]);

  function reload() {
    setCart(getCart());
  }

  useEffect(() => {
    reload();
    window.addEventListener("cart-updated", reload);
    return () => window.removeEventListener("cart-updated", reload);
  }, []);

  const total = cartTotal(cart);

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-4">Mon panier</h1>
        <p className="text-gray-500 mb-4">Votre panier est vide.</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Parcourir les catégories
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Mon panier</h1>

        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 bg-white rounded-lg shadow p-4"
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
                <p className="text-green-700 font-bold">{item.price} &euro;</p>
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

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => clearCart()}
            className="text-red-500 text-sm hover:underline"
          >
            Vider le panier
          </button>
          <div className="text-right">
            <p className="text-xl font-bold">
              Total : {total.toFixed(2)} &euro;
            </p>
            <Link
              href="/checkout"
              className="inline-block mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Passer au paiement
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
