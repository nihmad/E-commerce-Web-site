"use client";

import { FormEvent, useState } from "react";
import { apiFetch, setAccessToken } from "@/lib/api";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/token/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.access) {
        setAccessToken(data.access);
      }
      window.location.href = "/account";
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="surface-card w-full max-w-md px-8 py-7 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Connexion</h1>
        <p className="text-sm text-slate-500 text-center">
          Accède à ton compte pour finaliser tes commandes.
        </p>
        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded p-2">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="input-field text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            className="input-field text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <p className="text-sm text-center text-slate-500">
          Pas encore de compte ?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Créer un compte
          </a>
        </p>
      </form>
    </main>
  );
}