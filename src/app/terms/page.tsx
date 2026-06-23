import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of the FarmGate marketplace.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="June 2026">
      <p>
        These terms govern your use of FarmGate. By using the marketplace, you
        agree to them.
      </p>

      <h2>The marketplace</h2>
      <p>
        FarmGate connects animal keepers with buyers in Rwanda. We facilitate
        introductions and help coordinate transactions, but the sale agreement is
        between the buyer and the keeper.
      </p>

      <h2>Listings</h2>
      <ul>
        <li>Keepers must list only animals they own and may legally sell.</li>
        <li>
          Listing information (breed, age, health, price) must be accurate and
          honest.
        </li>
        <li>FarmGate may verify, edit or remove any listing.</li>
      </ul>

      <h2>Buyer responsibilities</h2>
      <ul>
        <li>Submit genuine requests through the platform only.</li>
        <li>
          Inspect the animal, or have FarmGate confirm its condition, before
          completing payment.
        </li>
      </ul>

      <h2>Animal health & welfare</h2>
      <p>
        All animals must be treated and transported humanely in line with Rwandan
        law. FarmGate does not permit the sale of stolen, diseased or
        unlawfully-traded animals.
      </p>

      <h2>Liability</h2>
      <p>
        FarmGate works to verify keepers and listings but does not guarantee any
        transaction. We are not liable for losses arising from dealings between
        buyers and keepers, to the extent permitted by law.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email {SITE.platform.email} or message{" "}
        {SITE.platform.whatsappDisplay} on WhatsApp.
      </p>
    </LegalLayout>
  );
}
