import Link from "next/link";

import { AuthScreen } from "@/components/forms/auth-screen";

export default function LoginPage() {
  return (
    <AuthScreen
      title="Welcome back"
      description="Sign in to generate meal plans, tune your nutrition targets, and keep grocery decisions aligned with your week."
      endpoint="/api/auth/login"
      submitLabel="Sign in"
      footer={
        <p className="text-sm text-slate-500">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-slate-950">
            Create your account
          </Link>
        </p>
      }
      fields={["email", "password"]}
    />
  );
}
