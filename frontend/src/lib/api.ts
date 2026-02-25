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

  if (token) {
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
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-updated"));
      }
      throw new ApiError("Session expirée. Veuillez vous reconnecter.", res.status, payload);
    }

    if (
      payload &&
      typeof payload === "object" &&
      "detail" in payload &&
      typeof (payload as { detail?: unknown }).detail === "string"
    ) {
      throw new ApiError((payload as { detail: string }).detail, res.status, payload);
    }

    if (typeof payload === "string" && payload.trim()) {
      throw new ApiError(payload, res.status, payload);
    }

    throw new ApiError(`Erreur API ${res.status}`, res.status, payload);
  }

  return res.json();
}