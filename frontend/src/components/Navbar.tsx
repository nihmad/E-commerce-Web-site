"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { setAccessToken } from "@/lib/api";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  function updateCartCount() {
    const cart = getCart();
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }

  function refreshToken() {
    setToken(window.localStorage.getItem("accessToken"));
  }

  useEffect(() => {
    updateCartCount();
    refreshToken();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("auth-updated", refreshToken);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("auth-updated", refreshToken);
    };
  }, []);

  function handleLogout() {
    setAccessToken(null);
    setToken(null);
    window.location.href = "/";
  }

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-600">
          Boutique
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-600">
            Accueil
          </Link>
          <Link href="/cart" className="hover:text-blue-600 relative">
            Panier
            {cartCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {token ? (
            <>
              <Link href="/account" className="hover:text-blue-600">
                Mon compte
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-blue-600">
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
