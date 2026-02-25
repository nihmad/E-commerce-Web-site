const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

let accessToken: string | null = null;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  username: "Nom d'utilisateur",
  password: "Mot de passe",
  non_field_errors: "Erreur",
  detail: "Erreur",
};

function toFrenchMessage(raw: string): string {
  const value = raw.trim();
  const lower = value.toLowerCase();

  if (lower.includes("no active account found with the given credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (lower.includes("token is invalid or expired")) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  if (lower.includes("given token not valid for any token type")) {
    return "Session expirée. Veuillez vous reconnecter.";
  }
  if (lower.includes("authentication credentials were not provided")) {
    return "Veuillez vous connecter pour continuer.";
  }
  if (lower.includes("informations d'authentification non fournies")) {
    return "Veuillez vous connecter pour continuer.";
  }
  if (lower.includes("a user with that email already exists")) {
    return "Un compte existe déjà avec cet email.";
  }
  if (lower.includes("a user with that username already exists")) {
    return "Ce nom d'utilisateur est déjà utilisé.";
  }
  if (lower === "this field is required.") {
    return "Ce champ est obligatoire.";
  }
  if (lower === "this password is too short. it must contain at least 8 characters.") {
    return "Le mot de passe est trop court (8 caractères minimum).";
  }
  if (lower.includes("this password is too common")) {
    return "Le mot de passe est trop courant.";
  }
  if (lower.includes("this password is entirely numeric")) {
    return "Le mot de passe ne peut pas être uniquement numérique.";
  }

  return value;
}

function extractApiErrorMessage(payload: unknown): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return toFrenchMessage(payload);
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = extractApiErrorMessage(item);
      if (nested) return nested;
    }
    return null;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.detail === "string") {
      return toFrenchMessage(record.detail);
    }

    if (Array.isArray(record.messages) && record.messages.length > 0) {
      const first = record.messages[0];
      if (first && typeof first === "object") {
        const firstMessage = (first as Record<string, unknown>).message;
        if (typeof firstMessage === "string") {
          return toFrenchMessage(firstMessage);
        }
      }
    }

    for (const [key, value] of Object.entries(record)) {
      const nested = extractApiErrorMessage(value);
      if (nested) {
        const label = FIELD_LABELS[key] || key;
        return key === "detail" || key === "non_field_errors" ? nested : `${label}: ${nested}`;
      }
    }
  }

  return null;
}

function shouldAttachAuthorizationHeader(path: string): boolean {
  return !(
    path.startsWith("/api/auth/token/") ||
    path === "/api/auth/token/" ||
    path === "/api/auth/signup/"
  );
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem("accessToken", token);
    } else {
      window.localStorage.removeItem("accessToken");
    }
  }
}

function getAccessToken(): string | null {
  if (accessToken) {
    return accessToken;
  }
  if (typeof window !== "undefined") {
    accessToken = window.localStorage.getItem("accessToken");
    return accessToken;
  }
  return null;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getAccessToken();

  const headers = new Headers({
    "Content-Type": "application/json",
  });
  if (options.headers) {
    const incoming = new Headers(options.headers);
    incoming.forEach((value, key) => headers.set(key, value));
  }

  if (token && shouldAttachAuthorizationHeader(path)) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    let payload: unknown = null;
    const text = await res.text();
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (res.status === 401) {
      const message = extractApiErrorMessage(payload);
      const isSigninCall = path === "/api/auth/token/" || path.startsWith("/api/auth/token/");

      if (!isSigninCall) {
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-updated"));
        }
      }

      throw new ApiError(
        message || (isSigninCall ? "Email ou mot de passe incorrect." : "Session expirée. Veuillez vous reconnecter."),
        res.status,
        payload
      );
    }
    throw new ApiError(extractApiErrorMessage(payload) || `Erreur API ${res.status}`, res.status, payload);
  }

  return res.json();
}