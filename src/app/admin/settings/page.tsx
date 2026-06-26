import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Site Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettings() {
  if (!(await isAdmin())) redirect("/admin/login");
  const settings = await getSettings();
  return (
    <AdminShell active="/admin/settings" title="Site settings">
      <p className="mb-6 max-w-2xl text-sm text-ink-soft">
        Update your logo, contact details and homepage copy. Changes go live
        across the whole site within a minute.
      </p>
      <SettingsForm settings={settings} />
    </AdminShell>
  );
}
