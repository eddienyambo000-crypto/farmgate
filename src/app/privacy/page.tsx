import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Farmgate collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        Farmgate (&quot;we&quot;, &quot;us&quot;) operates Rwanda&apos;s livestock
        marketplace. This policy explains what information we collect and how we
        use it. By using Farmgate you agree to this policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Buyers:</strong> your name, phone number and district when you
          submit a request for an animal.
        </li>
        <li>
          <strong>Keepers:</strong> your name, phone number, location and details
          of the animals you wish to list.
        </li>
        <li>
          Basic usage data (pages visited) to improve the marketplace.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To connect buyers and keepers and arrange safe transactions.</li>
        <li>To verify keepers and the animals they list.</li>
        <li>To contact you about your request or listing.</li>
      </ul>

      <h2>Protecting contacts</h2>
      <p>
        We do not publish individual buyer or seller contact details on the site.
        Requests are handled by the Farmgate team. We never sell your personal
        information to third parties.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your information only as long as needed to provide our service and
        meet legal obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal
        information by contacting us at {SITE.platform.email}.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email {SITE.platform.email} or message us on
        WhatsApp at {SITE.platform.whatsappDisplay}.
      </p>
    </LegalLayout>
  );
}
