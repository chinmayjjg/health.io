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

export const apiGet = async <TResponse>(
  path: string,
  query?: Record<string, string>,
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}${toSearchParams(query)}`);

  const data = (await response.json()) as TResponse & ApiErrorShape;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export const apiPost = async <TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & ApiErrorShape;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};
