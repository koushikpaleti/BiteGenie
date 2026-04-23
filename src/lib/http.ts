import { NextResponse } from "next/server";

import type { ApiResponse } from "@/types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    init,
  );
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function fail(message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      error: message,
    },
    { status },
  );
}
