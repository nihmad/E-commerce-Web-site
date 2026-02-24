"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { setAccessToken } from "@/lib/api";

export default function Navbar() {
  const [cartCount, setCartCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("accessToken");
  });

  function updateCartCount() {
    const cart = getCart();
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }

  function refreshToken() {
    setToken(window.localStorage.getItem("accessToken"));
  }

  useEffect(() => {
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
    <nav className="sticky top-0 z-50 border-b border-[#2f2a25] bg-[#13110f]/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold text-[#e7c38a] tracking-wide">
          Boutique
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-[#f2ece4]">
          <Link href="/" className="hover:text-[#e7c38a] transition-colors">
            Accueil
          </Link>
          <Link href="/cart" className="hover:text-[#e7c38a] relative transition-colors">
            Panier
            {cartCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-[#1b140d] bg-[#e7c38a] rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {token ? (
            <>
              <Link href="/account" className="hover:text-[#e7c38a] transition-colors">
                Mon compte
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#ef9f9f] hover:text-[#ffd1d1] transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-[#e7c38a] transition-colors">
                Connexion
              </Link>
              <Link
                href="/auth/signup"
                className="btn-gold py-1.5"
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
