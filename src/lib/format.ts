/** Format a number of Rwandan francs, e.g. 850000 -> "RWF 850,000". */
export function formatRwf(amount: number): string {
  return `RWF ${amount.toLocaleString("en-RW")}`;
}

/** Short relative-ish date, e.g. "2 Jun 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Member since June 2024" from "2024-06". */
export function formatMemberSince(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
