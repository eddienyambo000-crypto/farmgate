import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="grid min-h-[70vh] place-items-center bg-grain px-4 py-16">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] border border-line bg-surface p-8 shadow-[var(--shadow-lg)]">
        <p className="font-display text-2xl font-extrabold text-forest-deep">
          FarmGate Admin
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Sign in to manage leads and listings.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
