import { clearAuthToken, getAuthToken, saveAuthToken } from "@/lib/auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type ApiErrorShape = {
  message?: string;
};

const toSearchParams = (query?: Record<string, string>): string => {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value.trim()) {
      params.set(key, value.trim());
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};

const parseResponse = async <TResponse>(response: Response): Promise<TResponse> => {
  const data = (await response.json()) as TResponse & ApiErrorShape;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

const refreshAccessToken = async (): Promise<string | null> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    clearAuthToken();
    return null;
  }

  const data = (await response.json()) as { token?: string; accessToken?: string };
  const token = data.token || data.accessToken || null;

  if (token) {
    saveAuthToken(token);
  }

  return token;
};

const fetchWithAuth = async (
  path: string,
  init: RequestInit,
  retry = true,
): Promise<Response> => {
  const token = getAuthToken();

  const headers = new Headers(init.headers ?? undefined);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      throw new Error("Session expired. Please log in again.");
    }

    headers.set("Authorization", `Bearer ${newToken}`);
    const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });

    return retryResponse;
  }

  return response;
};

export const apiGet = async <TResponse>(
  path: string,
  query?: Record<string, string>,
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}${toSearchParams(query)}`, {
    credentials: "include",
  });
  return parseResponse<TResponse>(response);
};

export const apiPost = async <TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseResponse<TResponse>(response);
};

export const apiAuthGet = async <TResponse>(
  path: string,
  query?: Record<string, string>,
): Promise<TResponse> => {
  const response = await fetchWithAuth(`${path}${toSearchParams(query)}`, {
    method: "GET",
  });
  return parseResponse<TResponse>(response);
};

export const apiAuthPost = async <TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const response = await fetchWithAuth(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return parseResponse<TResponse>(response);
};
