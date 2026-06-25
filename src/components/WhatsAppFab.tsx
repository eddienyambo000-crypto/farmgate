import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFab() {
  const msg = encodeURIComponent(
    "Hello Farmgate — I have a question about buying or listing an animal.",
  );
  return (
    <a
      href={`https://wa.me/${SITE.platform.whatsapp}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Farmgate on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform duration-200 ease-[var(--ease-spring)] hover:scale-110 focus-visible:scale-110"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
    </a>
  );
}
