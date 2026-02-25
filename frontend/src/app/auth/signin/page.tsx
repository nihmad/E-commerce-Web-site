"use client";

import { FormEvent, useState } from "react";
import { ApiError, apiFetch, setAccessToken } from "@/lib/api";

type SigninFieldErrors = {
  email?: string;
  password?: string;
};

function firstMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const msg = firstMessage(entry);
      if (msg) return msg;
    }
  }
  return null;
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SigninFieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
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
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const details = err.details;
        if (details && typeof details === "object" && !Array.isArray(details)) {
          const record = details as Record<string, unknown>;
          const nextFieldErrors: SigninFieldErrors = {
            email: firstMessage(record.email) || undefined,
            password: firstMessage(record.password) || undefined,
          };
          setFieldErrors(nextFieldErrors);
        }
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur de connexion");
      }
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
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }}
            required
          />
          {fieldErrors.email && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            className="input-field text-sm"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }}
            required
          />
          {fieldErrors.password && (
            <p className="text-red-600 text-xs mt-1">{fieldErrors.password}</p>
          )}
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