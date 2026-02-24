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
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          Boutique
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Accueil
          </Link>
          <Link href="/cart" className="hover:text-blue-600 relative transition-colors">
            Panier
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {token ? (
            <>
              <Link href="/account" className="hover:text-blue-600 transition-colors">
                Mon compte
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-blue-600 transition-colors">
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary py-1.5"
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
