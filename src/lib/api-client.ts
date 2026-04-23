"use client";

import type { ApiResponse } from "@/types";

export async function apiFetch<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data as T;
}

export function jsonRequest(body?: unknown): RequestInit {
  return {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  };
}

export const swrFetcher = <T,>(url: string) => apiFetch<T>(url);
