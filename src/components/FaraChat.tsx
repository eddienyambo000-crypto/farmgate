"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/settings-context";

/**
 * Fara — Farmgate's AI assistant. Replaces the rule-based ChatWidget.
 *
 * The brain lives in n8n: live listing search, the Farmgate knowledge base,
 * Kinyarwanda / English / French, lead capture, scoring and follow-ups. This
 * component is only the window onto it.
 *
 * It calls the webhook straight from the browser, NOT through a Vercel
 * function: an agent turn can take 10-60s, longer than serverless time limits.
 * The webhook allows CORS from farmgaterwanda.com.
 *
 * Switched on by NEXT_PUBLIC_FARA_AI_URL in the root layout. Unset means the old
 * ChatWidget renders instead, so rollback is one env var plus a redeploy.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_FARA_AI_URL ?? "";
const INBOX = ENDPOINT.replace(/\/farmgate-chat\/?$/, "/farmgate-inbox");

const SID_KEY = "fara_sid";
const LOG_KEY = "fara_log";
const CAMPAIGN_KEY = "fara_campaign";
const MAX_LOG = 60;
const REPLY_TIMEOUT_MS = 120_000;
const SLOW_AFTER_MS = 8_000;
const INBOX_EVERY_MS = 60_000;

type Msg = { id: string; side: "bot" | "me"; text: string; error?: boolean };

const COPY = {
  en: {
    greeting:
      "Hi, I'm Fara 👋\nI help you find healthy animals from verified keepers. What are you looking for today?",
    chips: ["A dairy cow", "Goats for a wedding", "I want to sell", "How does payment work?"],
    status: "Online · 24/7",
    placeholder: "Type a message…",
    slow: "Checking the live listings…",
    error: "I couldn't get a reply just now. Try again, or reach the team on WhatsApp.",
    whatsapp: "Chat on WhatsApp",
    viewAnimal: "View this animal",
    open: "Chat with Fara",
    close: "Close chat",
    send: "Send",
  },
  rw: {
    greeting:
      "Muraho! Ndi Fara 👋\nNgufasha kubona itungo rizima ku borozi bemewe. Ushaka iki uyu munsi?",
    chips: ["Ndashaka inka y'amata", "Ihene zo ku bukwe", "Ndashaka kugurisha", "Kwishyura bikorwa gute?"],
    status: "Ndahari · 24/7",
    placeholder: "Andika ubutumwa…",
    slow: "Ndimo gushakisha mu matungo ahari…",
    error: "Sinshoboye kubona igisubizo ubu. Ongera ugerageze, cyangwa uvugane n'itsinda kuri WhatsApp.",
    whatsapp: "Vugana natwe kuri WhatsApp",
    viewAnimal: "Reba iri tungo",
    open: "Vugana na Fara",
    close: "Funga",
    send: "Ohereza",
  },
} as const;

/* ---------- browser storage (never throws: private mode, full quota) ---------- */

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable - the chat still works, it just won't survive a reload */
  }
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** One id per browser, so Fara's memory recognises a returning visitor. */
function sessionId(): string {
  let sid = load<string | null>(SID_KEY, null);
  if (!sid) {
    sid = `site-${newId()}`;
    save(SID_KEY, sid);
  }
  return sid;
}

/**
 * First-touch attribution: the utm_campaign that brought this visitor rides
 * along with every message, so campaign reporting counts buyers, not clicks.
 */
function campaign(): string | undefined {
  const known = load<string | null>(CAMPAIGN_KEY, null);
  if (known) return known;
  const fromUrl = new URLSearchParams(window.location.search).get("utm_campaign");
  if (fromUrl) save(CAMPAIGN_KEY, fromUrl);
  return fromUrl ?? undefined;
}

async function askFara(message: string): Promise<string> {
  const ctl = new AbortController();
  const timer = window.setTimeout(() => ctl.abort(), REPLY_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId(), message, campaign: campaign() }),
      signal: ctl.signal,
    });
    // Read as text first: res.json() on an empty body throws an unreadable error.
    const raw = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reply = ((raw.trim() ? JSON.parse(raw) : {}) as { reply?: string }).reply?.trim();
    if (!reply) throw new Error("empty reply");
    return reply;
  } finally {
    window.clearTimeout(timer);
  }
}

/* ---------- rendering Fara's text: line breaks, **bold**, links ---------- */

const LINK_RE = /https?:\/\/[^\s<>"')]+|(?:www\.)?farmgaterwanda\.com(?:\/[^\s<>"')]*)?/gi;
const LINK_CLASS =
  "font-semibold text-forest underline decoration-forest/40 underline-offset-2 hover:decoration-forest";

function parseUrl(href: string): URL | null {
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

function Bold({ text }: { text: string }) {
  const bits = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {bits.map((bit, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold">
            {bit}
          </strong>
        ) : (
          <span key={i}>{bit}</span>
        ),
      )}
    </>
  );
}

function SmartLink({ raw, viewAnimal }: { raw: string; viewAnimal: string }) {
  const url = parseUrl(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  if (!url) return <span>{raw}</span>;

  // Farmgate's own pages navigate in-app, so the chat stays open.
  if (/(^|\.)farmgaterwanda\.com$/i.test(url.hostname)) {
    const path = `${url.pathname}${url.search}` || "/";
    const label = url.pathname.startsWith("/animals/")
      ? `${viewAnimal} →`
      : path === "/"
        ? "farmgaterwanda.com"
        : path;
    return (
      <Link href={path} className={LINK_CLASS}>
        {label}
      </Link>
    );
  }
  return (
    <a href={url.toString()} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {raw} ↗
    </a>
  );
}

function RichText({ text, viewAnimal }: { text: string; viewAnimal: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const start = m.index ?? 0;
    const link = m[0].replace(/[.,;:!?]+$/, ""); // trailing punctuation stays as text
    if (start > last) parts.push(<Bold key={`t${last}`} text={text.slice(last, start)} />);
    parts.push(<SmartLink key={`l${start}`} raw={link} viewAnimal={viewAnimal} />);
    last = start + link.length;
  }
  if (last < text.length) parts.push(<Bold key={`t${last}`} text={text.slice(last)} />);
  return <>{parts}</>;
}

/* ---------- the widget ---------- */

export function FaraChat() {
  const { lang } = useI18n();
  const { contactWhatsapp } = useSettings();
  const t = COPY[lang];

  const [open, setOpen] = useState(false);
  // Panel starts closed, so restoring history here cannot cause a hydration mismatch.
  const [msgs, setMsgs] = useState<Msg[]>(() => load<Msg[]>(LOG_KEY, []));
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [unread, setUnread] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    save(LOG_KEY, msgs.slice(-MAX_LOG));
  }, [msgs]);

  useEffect(() => {
    campaign(); // capture utm_campaign on landing, before any navigation drops it
  }, []);

  useEffect(() => {
    if (open) scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [open, msgs, busy, slow]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Follow-ups Fara wrote while the visitor was away wait in an inbox. Only
  // visitors who have actually chatted, and only while the tab is visible, poll
  // it - a first-time visitor costs the server nothing.
  useEffect(() => {
    if (!INBOX) return;
    let cancelled = false;
    const check = async () => {
      if (document.visibilityState !== "visible") return;
      if (!load<Msg[]>(LOG_KEY, []).some((m) => m.side === "me")) return;
      try {
        const res = await fetch(INBOX, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId() }),
        });
        if (!res.ok) return;
        const raw = await res.text();
        const data = (raw.trim() ? JSON.parse(raw) : {}) as { messages?: { text?: string }[] };
        const texts = (data.messages ?? []).map((m) => (m.text ?? "").trim()).filter(Boolean);
        if (cancelled || texts.length === 0) return;
        setMsgs((m) => [...m, ...texts.map((text) => ({ id: newId(), side: "bot" as const, text }))]);
        if (!openRef.current) setUnread(true);
      } catch {
        /* dropped connection - the next tick tries again */
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), INBOX_EVERY_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  function openPanel() {
    setOpen(true);
    setUnread(false);
    window.setTimeout(() => inputRef.current?.focus(), 60);
  }

  async function send(text?: string) {
    const message = (text ?? value).trim();
    if (!message || busy || !ENDPOINT) return;
    setValue("");
    setBusy(true);
    setMsgs((m) => [...m, { id: newId(), side: "me", text: message }]);
    const slowTimer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);

    try {
      let reply: string;
      try {
        reply = await askFara(message);
      } catch (err) {
        // fetch rejects with a TypeError when the network fails outright. A timeout
        // or an HTTP error means Fara may already be acting on the message, so
        // repeating it could create a second inquiry - those are not retried.
        if (!(err instanceof TypeError)) throw err;
        await new Promise((r) => window.setTimeout(r, 1500));
        reply = await askFara(message);
      }
      setMsgs((m) => [...m, { id: newId(), side: "bot", text: reply }]);
    } catch {
      setMsgs((m) => [...m, { id: newId(), side: "bot", text: t.error, error: true }]);
    } finally {
      window.clearTimeout(slowTimer);
      setSlow(false);
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  if (!ENDPOINT) return null;

  const conversation: Msg[] = msgs.length ? msgs : [{ id: "greeting", side: "bot", text: t.greeting }];
  const showChips = !msgs.some((m) => m.side === "me");
  const waDigits = (contactWhatsapp ?? "").replace(/[^\d]/g, "");
  const waHref = waDigits ? `https://wa.me/${waDigits}` : null;

  return (
    <>
      {/* launcher */}
      {!open && (
        <button
          type="button"
          onClick={openPanel}
          aria-label={t.open}
          className="fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-forest text-white shadow-[0_10px_30px_rgba(18,45,34,0.45)] transition-transform duration-200 ease-[var(--ease-spring)] hover:scale-110 focus-visible:scale-110 lg:bottom-6 lg:right-6"
        >
          <ChatGlyph />
          {unread && (
            <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-background bg-gold" />
          )}
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-forest/30" />
        </button>
      )}

      {/* panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Fara · Farmgate"
          className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-line bg-cream shadow-[var(--shadow-lg)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[80dvh] sm:w-[384px] sm:rounded-[var(--radius-xl)]"
        >
          <header className="flex items-center gap-3 bg-forest-deep px-4 py-3 text-cream">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-lg shadow-[0_0_0_2px_rgba(255,255,255,0.15)]">
              🐐
            </span>
            <div className="min-w-0 leading-tight">
              <p className="flex items-center gap-1 font-display font-bold">
                Fara · Farmgate <span className="text-leaf">✓</span>
              </p>
              <p className="flex items-center gap-1.5 text-xs text-cream/80">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> {t.status}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full text-cream/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <CloseGlyph />
            </button>
          </header>

          <div
            ref={scroller}
            aria-live="polite"
            className="flex-1 space-y-2.5 overflow-y-auto bg-[radial-gradient(rgba(20,36,28,0.04)_0.5px,transparent_0.5px)] [background-size:15px_15px] px-3.5 py-4"
          >
            {conversation.map((m) => (
              <div key={m.id} className={m.side === "me" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[86%] whitespace-pre-line break-words rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-[0_1px_1px_rgba(20,36,28,0.08)] ${
                    m.side === "me" ? "rounded-tr-sm bg-leaf-tint text-forest-deep" : "rounded-tl-sm bg-surface text-ink"
                  }`}
                >
                  {m.side === "bot" ? <RichText text={m.text} viewAnimal={t.viewAnimal} /> : m.text}
                  {m.error && waHref && (
                    <div className="mt-2">
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-deep"
                      >
                        {t.whatsapp} ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-surface px-3.5 py-3 shadow-[0_1px_1px_rgba(20,36,28,0.08)]">
                  <span className="inline-flex gap-1">
                    <Dot /> <Dot d={0.15} /> <Dot d={0.3} />
                  </span>
                  {slow && <p className="mt-1.5 text-xs text-ink-muted">{t.slow}</p>}
                </div>
              </div>
            )}
          </div>

          {showChips && (
            <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-1.5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {t.chips.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => void send(c)}
                  disabled={busy}
                  className="shrink-0 cursor-pointer whitespace-nowrap rounded-full border border-forest-soft bg-surface px-3 py-1.5 text-xs font-semibold text-forest-deep transition-colors hover:bg-leaf-tint disabled:opacity-50"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-center gap-2 border-t border-line bg-cream-deep/60 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              maxLength={1000}
              className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus-visible:border-forest"
            />
            <button
              type="submit"
              disabled={busy || !value.trim()}
              aria-label={t.send}
              className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-forest text-white transition-transform duration-150 hover:bg-forest-deep active:scale-90 disabled:opacity-40"
            >
              <SendGlyph />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-ink-muted/60"
      style={{ animation: `fgblink 1.2s ${d}s infinite` }}
    />
  );
}

function ChatGlyph() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
