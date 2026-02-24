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
    return <main className="p-8">Chargement...</main>;
  }

  if (error || !user) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error}</p>
        <Link href="/auth/signin" className="text-blue-600 underline">
          Aller à la page de connexion
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Mon compte</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-3">
          <p><strong>Email :</strong> {user.email}</p>
          <p><strong>Nom d&apos;utilisateur :</strong> {user.username}</p>
          <p><strong>Rôle :</strong> {user.role}</p>
        </div>

        <div className="mt-6 flex gap-4">
          <Link
            href="/account/orders"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Mes commandes
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-500 px-4 py-2 border border-red-300 rounded hover:bg-red-50"
          >
            Déconnexion
          </button>
        </div>
      </section>
    </main>
  );
}