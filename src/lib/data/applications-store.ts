import "server-only";

/**
 * Seller applications (demo/seed mode). A keeper who wants to list submits this;
 * the FarmGate admin reviews, verifies and publishes. Replaced by a Supabase
 * `seller_applications` table in production.
 */
export interface SellerApplication {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  animalType: string;
  animalCount: string;
  details: string;
  createdAt: string;
}

const store: SellerApplication[] = [];

export function addApplication(app: SellerApplication): void {
  store.unshift(app);
}

export function listApplications(): SellerApplication[] {
  return [...store];
}
