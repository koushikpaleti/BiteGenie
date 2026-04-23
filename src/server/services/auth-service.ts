import { connectToDatabase } from "@/lib/db";
import {
  comparePassword,
  hashPassword,
  serializeUser,
  signAuthToken,
} from "@/lib/auth";
import { UserModel } from "@/server/models/User";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  await connectToDatabase();

  const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });

  if (existingUser) {
    throw new Error("An account with that email already exists");
  }

  const user = await UserModel.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: await hashPassword(input.password),
  });

  const serializedUser = serializeUser({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    preferences: user.preferences,
  });

  return {
    user: serializedUser,
    token: signAuthToken({
      sub: serializedUser.id,
      email: serializedUser.email,
    }),
  };
}

export async function loginUser(input: { email: string; password: string }) {
  await connectToDatabase();

  const user = await UserModel.findOne({
    email: input.email.toLowerCase(),
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await comparePassword(input.password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  const serializedUser = serializeUser({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    preferences: user.preferences,
  });

  return {
    user: serializedUser,
    token: signAuthToken({
      sub: serializedUser.id,
      email: serializedUser.email,
    }),
  };
}

export async function updateProfile(
  userId: string,
  input: { name: string; preferences: unknown },
) {
  await connectToDatabase();

  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        name: input.name,
        preferences: input.preferences,
      },
    },
    { new: true },
  ).lean();

  if (!user) {
    throw new Error("User not found");
  }

  return serializeUser({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    preferences: user.preferences,
  });
}
