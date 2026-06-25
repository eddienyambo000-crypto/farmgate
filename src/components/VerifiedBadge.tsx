import { ShieldCheckIcon } from "./icons";

export function VerifiedBadge({
  size = "sm",
  label = true,
}: {
  size?: "sm" | "md";
  label?: boolean;
}) {
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const text = size === "md" ? "text-sm" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gold-tint px-2 py-0.5 font-semibold text-gold-deep ${text}`}
      title="Verified keeper — identity and animals confirmed by Farmgate"
    >
      <ShieldCheckIcon className={icon} />
      {label && "Verified"}
    </span>
  );
}
