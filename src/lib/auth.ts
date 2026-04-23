import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { connectToDatabase } from "@/lib/db";
import { requireEnv } from "@/lib/env";
import { UserModel } from "@/server/models/User";
import type { AuthUser } from "@/types";

const AUTH_COOKIE = "smart_meal_auth";

interface JwtPayload {
  sub: string;
  email: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload: JwtPayload) {
  return jwt.sign(payload, requireEnv("jwtSecret"), {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, requireEnv("jwtSecret")) as JwtPayload;
}

export function getAuthCookieName() {
  return AUTH_COOKIE;
}

export function serializeUser(user: {
  _id: string;
  name: string;
  email: string;
  preferences: AuthUser["preferences"];
}): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    preferences: user.preferences,
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    await connectToDatabase();
    const payload = verifyAuthToken(token);
    const user = await UserModel.findById(payload.sub).lean();

    if (!user) {
      return null;
    }

    return serializeUser({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      preferences: user.preferences,
    });
  } catch {
    return null;
  }
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
