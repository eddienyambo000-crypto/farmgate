import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { GuideForm } from "@/components/admin/GuideForm";
import { createGuideAction } from "@/lib/actions/content";

export const metadata: Metadata = {
  title: "New Guide",
  robots: { index: false, follow: false },
};

export default async function NewGuide() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <AdminShell active="/admin/guides" title="New guide">
      <GuideForm action={createGuideAction} />
    </AdminShell>
  );
}
