import mongoose from "mongoose";

import { requireEnv } from "@/lib/env";

declare global {
  var __mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.__mongooseConnection ?? {
  conn: null,
  promise: null,
};

global.__mongooseConnection = cached;

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(requireEnv("mongodbUri"), {
      dbName: "smart-meal-planner",
      autoIndex: true,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
