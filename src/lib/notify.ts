import "server-only";

/**
 * Sends a new lead / keeper application to the owner's n8n webhook, which then
 * fires the WhatsApp message. No-ops if N8N_WEBHOOK_URL isn't set, and never
 * throws — a notification failure must never break a buyer's submission.
 */
type LeadPayload = {
  type: "lead";
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  message: string;
  animal: string;
  animalUrl: string;
};

type ApplicationPayload = {
  type: "application";
  fullName: string;
  phone: string;
  district: string;
  animalType: string;
  animalCount: string;
  details: string;
};

export async function notifyOwner(
  payload: LeadPayload | ApplicationPayload,
): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, site: "farmgaterwanda.com", at: new Date().toISOString() }),
      signal: controller.signal,
    });
    clearTimeout(t);
  } catch {
    /* best-effort */
  }
}
