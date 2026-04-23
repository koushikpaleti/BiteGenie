import { cookies } from "next/headers";

import { env } from "@/lib/env";
import { fail, ok } from "@/lib/http";
import { getAuthCookieName, getCurrentUser } from "@/lib/auth";
import { loginUser, registerUser } from "@/server/services/auth-service";
import { loginSchema, registerSchema } from "@/server/validators/auth";

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

function shouldUseSecureCookies(request: Request) {
  const requestUrl = new URL(request.url);
  const appUrl = env.appUrl ? new URL(env.appUrl) : null;
  const requestIsLocal = localHosts.has(requestUrl.hostname);
  const appIsLocal = appUrl ? localHosts.has(appUrl.hostname) : false;

  return requestUrl.protocol === "https:" || (env.nodeEnv === "production" && !requestIsLocal && !appIsLocal);
}

function getCookieOptions(request: Request) {
  return {
  httpOnly: true,
  secure: shouldUseSecureCookies(request),
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  };
}

export async function registerController(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const payload = await registerUser(body);
    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieName(), payload.token, getCookieOptions(request));
    return ok(payload.user, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to register", 400);
  }
}

export async function loginController(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const payload = await loginUser(body);
    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieName(), payload.token, getCookieOptions(request));
    return ok(payload.user);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to login", 400);
  }
}

export async function meController() {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  return ok(user);
}

export async function logoutController() {
  const cookieStore = await cookies();
  cookieStore.delete(getAuthCookieName());
  return ok({ loggedOut: true });
}
