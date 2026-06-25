import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { ListingForm } from "@/components/admin/ListingForm";
import { listSellers } from "@/lib/data/admin-repo";
import { createListingAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Add Animal",
  robots: { index: false, follow: false },
};

export default async function NewListing() {
  if (!(await isAdmin())) redirect("/admin/login");
  const sellers = (await listSellers()).map((s) => ({
    id: s.id,
    displayName: s.displayName,
  }));

  return (
    <AdminShell active="/admin/listings" title="Add a new animal">
      <ListingForm action={createListingAction} sellers={sellers} />
    </AdminShell>
  );
}
