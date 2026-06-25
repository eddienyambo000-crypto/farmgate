import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { ListingForm } from "@/components/admin/ListingForm";
import { listSellers, getListingById } from "@/lib/data/admin-repo";
import { updateListingAction } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: "Edit Animal",
  robots: { index: false, follow: false },
};

export default async function EditListing({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const sellers = (await listSellers()).map((s) => ({
    id: s.id,
    displayName: s.displayName,
  }));

  return (
    <AdminShell active="/admin/listings" title={`Edit: ${listing.title}`}>
      <ListingForm
        action={updateListingAction.bind(null, id)}
        sellers={sellers}
        listing={listing}
      />
    </AdminShell>
  );
}
