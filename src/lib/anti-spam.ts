/**
 * Zero-dependency spam defense for public forms (inquiries, seller applications).
 *
 * Two cheap, reliable signals — no external service, no keys:
 *   1. Honeypot — a hidden field real users never see. Bots fill every field,
 *      so any value here means "bot".
 *   2. Time-trap — humans take seconds to read + fill a form; bots submit almost
 *      instantly. A submit faster than MIN_SUBMIT_MS is almost certainly a bot.
 *
 * We fail *open* on missing/garbled timing (elapsedMs undefined) so a real user
 * is never wrongly blocked — the honeypot still catches the obvious bots.
 */
export interface SpamSignals {
  honeypot?: string;
  elapsedMs?: number;
}

const MIN_SUBMIT_MS = 1500;

export function isSpam({ honeypot, elapsedMs }: SpamSignals): boolean {
  if (honeypot && honeypot.trim().length > 0) return true;
  if (typeof elapsedMs === "number" && elapsedMs >= 0 && elapsedMs < MIN_SUBMIT_MS)
    return true;
  return false;
}

/** Field names shared by the client fields component and the form handlers. */
export const SPAM_FIELDS = { honeypot: "_hp", mountedAt: "_t" } as const;
