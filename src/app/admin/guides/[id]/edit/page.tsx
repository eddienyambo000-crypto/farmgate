import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { GuideForm } from "@/components/admin/GuideForm";
import { getGuideByIdAdmin } from "@/lib/data/admin-repo";
import { updateGuideAction } from "@/lib/actions/content";

export const metadata: Metadata = {
  title: "Edit Guide",
  robots: { index: false, follow: false },
};

export default async function EditGuide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const guide = await getGuideByIdAdmin(id);
  if (!guide) notFound();

  return (
    <AdminShell active="/admin/guides" title={`Edit: ${guide.title}`}>
      <GuideForm action={updateGuideAction.bind(null, id)} guide={guide} />
    </AdminShell>
  );
}
