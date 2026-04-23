import Link from "next/link";

import { AuthScreen } from "@/components/forms/auth-screen";

export default function SignupPage() {
  return (
    <AuthScreen
      title="Build your smarter food system"
      description="Create your account to unlock AI recipes, weekly plans, macro tracking, and grocery intelligence in one workspace."
      endpoint="/api/auth/register"
      submitLabel="Create account"
      footer={
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-950">
            Sign in
          </Link>
        </p>
      }
      fields={["name", "email", "password"]}
    />
  );
}
