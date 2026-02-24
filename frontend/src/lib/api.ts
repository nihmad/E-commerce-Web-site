const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

let accessToken: string | null = null;

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

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401) {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-updated"));
      }
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }

    throw new Error(text || `Erreur API ${res.status}`);
  }

  return res.json();
}