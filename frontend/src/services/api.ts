import type { AuthResponse, Generation } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const toAbsoluteUrl = (path: string) =>
  path.startsWith('http') ? path : `${API_URL}${path}`;

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message ?? 'Something went wrong';
    throw new Error(message);
  }
  return data;
};

export const signup = async (payload: { email: string; password: string }) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return (await handleResponse(response)) as AuthResponse;
};

export const login = async (payload: { email: string; password: string }) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return (await handleResponse(response)) as AuthResponse;
};

export const fetchGenerations = async (
  token: string,
  limit = 5,
): Promise<Generation[]> => {
  const response = await fetch(`${API_URL}/generations?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await handleResponse(response);
  return (data as Generation[]).map((item) => ({
    ...item,
    createdAt: item.createdAt,
    imageUrl: toAbsoluteUrl(item.imageUrl),
  }));
};

export const createGeneration = async ({
  token,
  formData,
  signal,
}: {
  token: string;
  formData: FormData;
  signal?: AbortSignal;
}): Promise<Generation> => {
  const response = await fetch(`${API_URL}/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    signal,
  });

  const data = await handleResponse(response);
  return {
    ...data,
    imageUrl: toAbsoluteUrl(data.imageUrl),
  };
};

