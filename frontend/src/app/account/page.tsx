"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, setAccessToken } from "@/lib/api";

type User = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMe() {
      try {
        const data = await apiFetch("/api/auth/me/");
        setUser(data);
      } catch (err: any) {
        setError(err.message || "Non connecté. Veuillez vous identifier.");
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, []);

  function handleLogout() {
    setAccessToken(null);
    window.location.href = "/";
  }

  if (loading) {
    return <main className="page-shell page-container">Chargement...</main>;
  }

  if (error || !user) {
    return (
      <main className="page-shell page-container max-w-xl">
        <p className="text-red-600 bg-red-50 border border-red-100 rounded p-3 mb-3">{error}</p>
        <Link href="/auth/signin" className="text-blue-600 underline">
          Aller à la page de connexion
        </Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-container max-w-2xl">
        <h1 className="section-title mb-6">Mon compte</h1>

        <div className="surface-card p-6 space-y-3">
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Nom d&apos;utilisateur :</strong> {user.username}</p>
          <p><strong>Rôle :</strong> {user.role}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href="/account/orders"
            className="btn-primary"
          >
            Mes commandes
          </Link>
          <button
            onClick={handleLogout}
            className="btn-danger"
          >
            Déconnexion
          </button>
        </div>
      </section>
    </main>
  );
}