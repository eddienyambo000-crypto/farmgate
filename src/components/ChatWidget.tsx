"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { useCategories } from "@/lib/categories-context";
import type { CategoryMeta } from "@/lib/categories";
import { submitChatLead } from "@/lib/actions/chat-lead";

/**
 * "Fara" — Farmgate's on-site chat assistant. Fully client-side (no API cost):
 * a rule-based guide that answers real FAQs, points buyers to real listings, and
 * captures a real lead into fg_inquiries via submitChatLead. It NEVER invents a
 * specific animal, price or delivery — everything it states is true to the site.
 * Lives in the root layout, so it persists (and keeps the conversation) across
 * page navigation.
 */

type Msg = {
  id: number;
  side: "bot" | "me";
  text: string;
  links?: { label: string; href: string; external?: boolean }[];
};

type LeadStage = "off" | "name" | "phone" | "district";

const DISTRICT_CHIPS = ["Kigali", "Musanze", "Nyagatare", "Bugesera", "Skip"];

export function ChatWidget() {
  const { contactWhatsapp } = useSettings();
  const categories = useCategories();

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chips, setChips] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState("");
  const [unread, setUnread] = useState(true);

  const started = useRef(false);
  const idRef = useRef(0);
  const leadRef = useRef<LeadStage>("off");
  const draft = useRef<{ name?: string; phone?: string; district?: string; want?: string }>({});
  const scroller = useRef<HTMLDivElement>(null);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const nextId = () => ++idRef.current;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing, chips]);

  function pushMe(text: string) {
    setMsgs((m) => [...m, { id: nextId(), side: "me", text }]);
  }
  function pushBot(text: string, links?: Msg["links"]) {
    setMsgs((m) => [...m, { id: nextId(), side: "bot", text, links }]);
  }
  async function botSay(lines: string | { text: string; links?: Msg["links"] }[]) {
    const arr = typeof lines === "string" ? [{ text: lines }] : lines;
    for (const l of arr) {
      setTyping(true);
      await sleep(500 + Math.min(l.text.length * 7, 650));
      setTyping(false);
      pushBot(l.text, l.links);
      await sleep(180);
    }
  }

  function detectCategory(t: string): CategoryMeta | null {
    for (const c of categories) {
      const words = `${c.synonyms} ${c.label} ${c.plural} ${c.labelRw} ${c.type}`
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);
      if (words.some((w) => t.includes(w))) return c;
    }
    return null;
  }

  /* ---------- boot ---------- */
  async function boot() {
    if (started.current) return;
    started.current = true;
    await botSay([
      { text: "Muraho! 👋 I'm Fara, Farmgate's assistant. I help you find healthy animals from verified keepers — and I'm here 24/7." },
      { text: "What are you looking for today?" },
    ]);
    setChips(["A dairy cow", "Goats", "Chickens", "How does it work?"]);
  }

  function openPanel() {
    setOpen(true);
    setUnread(false);
    if (!started.current) void boot();
  }

  /* ---------- support answers (all TRUE to the site) ---------- */
  function support(t: string): { text: string; links?: Msg["links"] }[] | null {
    const wa = { label: "Chat on WhatsApp", href: `https://wa.me/${contactWhatsapp}`, external: true };
    if (/\bpay\b|payment|momo|mobile money|cash|kwishyura|amafaranga|deposit|upfront/.test(t))
      return [{ text: "You pay the keeper on delivery, after you inspect the animal — MoMo or cash. Farmgate never asks for money upfront. 🔒" }];
    if (/vaccin|kingiwe|inkingo|health|sick|disease|deworm/.test(t))
      return [{ text: "Every listing shows the animal's health & vaccination details, and our keepers are verified. Check the health badge on each animal — and you can always inspect before you pay. 💉" }];
    if (/refund|return|guarantee|not happy|scam|fake|cheat|trust.*money|what if/.test(t))
      return [{ text: "You inspect the animal before you pay. If it's not as described, you simply don't pay — that's how Farmgate protects buyers. 🛡️" }];
    if (/deliver|delivery|transport|gutwara|bring it|far|distance/.test(t))
      return [{ text: "Yes — once you request an animal, our team helps arrange delivery to your area and coordinates the day with you directly. 🚚" }];
    if (/broker|middlem|commission|markup/.test(t))
      return [{ text: "No brokers here 🙌 You deal straight through Farmgate — no middleman markup. The keeper's price is the price." }];
    if (/verif|genuine|legit|trust|real seller/.test(t))
      return [{ text: "Every keeper on Farmgate is verified ✓ — we confirm their identity before they can list. You're always buying from a real, checked keeper." }];
    if (/\bsell\b|list.*(animal|my)|i am a keeper|become.*keeper|nagurisha|kugurisha/.test(t))
      return [{ text: "Great — you can list your animals with us and reach buyers across Rwanda. Start here 👇", links: [{ label: "List an animal", href: "/sell" }] }];
    if (/how.*(work|it work)|process|how do i|guide/.test(t))
      return [{ text: "Simple: browse animals → request the one you like → our team arranges the viewing & delivery. Your contact stays private the whole way.", links: [{ label: "How it works", href: "/how-it-works" }, { label: "Browse animals", href: "/animals" }] }];
    if (/office|located|address|where are you|contact|phone number|call you|reach you/.test(t))
      return [{ text: "We're online right here 24/7, and serve buyers & keepers all over Rwanda. You can also reach the team on WhatsApp. 📍", links: [wa] }];
    if (/murakoze|thank|thx|great|nice|cool|ok(ay)?$/.test(t))
      return [{ text: "Nta kibazo! 🙏 I'm here whenever you need anything." }];
    if (/^(hi|hello|hey|muraho|yego|good (morning|evening|afternoon))\b/.test(t))
      return [{ text: "Muraho neza! 👋 What animal are you looking for today?" }];
    return null;
  }

  /* ---------- lead capture ---------- */
  function startLead(reason?: string) {
    leadRef.current = "name";
    void botSay(
      reason
        ? `Perfect — I'll have the Farmgate team reach out about ${reason}. First, what's your name?`
        : "Happy to have the team reach out. What's your name?",
    );
    setChips([]);
  }

  async function handleLead(text: string): Promise<void> {
    const stage = leadRef.current;
    if (stage === "name") {
      if (text.trim().length < 2) {
        await botSay("Please type your name so the team knows who to ask for. 🙂");
        return;
      }
      draft.current.name = text.trim();
      leadRef.current = "phone";
      await botSay(`Thanks ${draft.current.name.split(" ")[0]}! What's the best phone number to reach you? (e.g. 0788 123 456)`);
      return;
    }
    if (stage === "phone") {
      draft.current.phone = text.trim();
      leadRef.current = "district";
      await botSay("Got it. Which district are you in? (or tap Skip)");
      setChips(DISTRICT_CHIPS);
      return;
    }
    if (stage === "district") {
      draft.current.district = /^skip$/i.test(text.trim()) ? "" : text.trim();
      setChips([]);
      setTyping(true);
      const res = await submitChatLead({
        name: draft.current.name ?? "",
        phone: draft.current.phone ?? "",
        district: draft.current.district,
        want: draft.current.want,
      });
      setTyping(false);
      if (res.ok) {
        leadRef.current = "off";
        await botSay([
          { text: `✅ Done! The Farmgate team has your details and will reach out shortly${draft.current.want ? ` about ${draft.current.want}` : ""}. Keep your phone close. 🌱` },
          { text: "Anything else I can help with?", links: [{ label: "Browse animals", href: "/animals" }] },
        ]);
        setChips(["How do I pay?", "Do you deliver?"]);
      } else {
        // Most likely an invalid phone — send them back one step.
        leadRef.current = "phone";
        await botSay(`${res.error} What number should the team call?`);
      }
      return;
    }
  }

  /* ---------- main router ---------- */
  async function route(text: string) {
    const t = text.toLowerCase().trim();

    if (/^(restart|start over|reset)$/.test(t)) {
      leadRef.current = "off";
      draft.current = {};
      await botSay("Fresh start! 🌱 What animal are you looking for?");
      setChips(["A dairy cow", "Goats", "Chickens", "How does it work?"]);
      return;
    }

    if (leadRef.current !== "off") {
      // Let real questions interrupt the lead capture.
      const sup = support(t);
      if (sup && /\bpay\b|vaccin|deliver|refund|broker|verif|how.*work/.test(t)) {
        await botSay(sup);
        const q =
          leadRef.current === "name" ? "So — what's your name?"
          : leadRef.current === "phone" ? "What's the best phone number to reach you?"
          : "Which district are you in? (or tap Skip)";
        await botSay(q);
        if (leadRef.current === "district") setChips(DISTRICT_CHIPS);
        return;
      }
      await handleLead(text);
      return;
    }

    // lead intent
    if (/call me|contact me|reach me|leave.*(number|contact)|get a call|notify me|yes.*call|find me|match/.test(t)) {
      startLead(draft.current.want);
      return;
    }

    // support
    const sup = support(t);
    if (sup) {
      await botSay(sup);
      if (!/how.*work|sell|office|contact/.test(t))
        setChips(["Browse animals", "Get a call about a match", "List an animal"]);
      return;
    }

    // animal match → real browse link + offer callback
    const cat = detectCategory(t);
    if (cat) {
      draft.current.want = cat.plural;
      await botSay([
        { text: `We have ${cat.plural.toLowerCase()} from verified keepers across Rwanda 🐄 — here's the live list:`, links: [{ label: `Browse ${cat.plural}`, href: `/animals?type=${cat.type}` }] },
        { text: "Want the team to call you when there's a great match in your budget?" },
      ]);
      setChips(["Yes, call me 🙌", "Browse animals", "How do I pay?"]);
      return;
    }

    if (/browse|animals|show|list|available|see/.test(t)) {
      await botSay([{ text: "Here's everything available right now — filter by animal, district and price:", links: [{ label: "Browse all animals", href: "/animals" }] }]);
      setChips(["Get a call about a match", "How do I pay?"]);
      return;
    }

    // fallback
    await botSay("I can help you find an animal, answer questions about payment, delivery or safety, or connect you with the team. What would you like? 🌱");
    setChips(["Find an animal", "How do I pay?", "Do you deliver?", "List an animal"]);
  }

  async function submit(text?: string) {
    const msg = (text ?? value).trim();
    if (!msg || busy) return;
    setValue("");
    setChips([]);
    setBusy(true);
    pushMe(msg);
    try {
      await route(msg);
    } catch {
      await botSay("Sorry, say that again? 🙏");
    }
    setBusy(false);
  }

  /* ---------- render ---------- */
  return (
    <>
      {/* launcher */}
      {!open && (
        <button
          onClick={openPanel}
          aria-label="Chat with Farmgate"
          className="fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-forest text-white shadow-[0_10px_30px_rgba(18,45,34,0.45)] transition-transform duration-200 ease-[var(--ease-spring)] hover:scale-110 focus-visible:scale-110 lg:bottom-6 lg:right-6"
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
          aria-label="Farmgate chat assistant"
          className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-line bg-cream shadow-[var(--shadow-lg)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[80dvh] sm:w-[384px] sm:rounded-[var(--radius-xl)]"
        >
          {/* header */}
          <header className="flex items-center gap-3 bg-forest-deep px-4 py-3 text-cream">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-lg shadow-[0_0_0_2px_rgba(255,255,255,0.15)]">
              🐐
            </span>
            <div className="min-w-0 leading-tight">
              <p className="flex items-center gap-1 font-display font-bold">
                Fara · Farmgate <span className="text-leaf">✓</span>
              </p>
              <p className="flex items-center gap-1.5 text-xs text-cream/80">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> Online · replies instantly
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto grid h-8 w-8 place-items-center rounded-full text-cream/80 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <CloseGlyph />
            </button>
          </header>

          {/* messages */}
          <div ref={scroller} className="flex-1 space-y-2.5 overflow-y-auto bg-[radial-gradient(rgba(20,36,28,0.04)_0.5px,transparent_0.5px)] [background-size:15px_15px] px-3.5 py-4">
            {msgs.map((m) => (
              <div key={m.id} className={m.side === "me" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-[0_1px_1px_rgba(20,36,28,0.08)] ${
                    m.side === "me"
                      ? "rounded-tr-sm bg-leaf-tint text-forest-deep"
                      : "rounded-tl-sm bg-surface text-ink"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.links && m.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.links.map((l) =>
                        l.external ? (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-deep"
                          >
                            {l.label} ↗
                          </a>
                        ) : (
                          <Link
                            key={l.label}
                            href={l.href}
                            className="inline-flex items-center gap-1 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-deep"
                          >
                            {l.label} →
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="inline-flex gap-1 rounded-2xl rounded-tl-sm bg-surface px-3.5 py-3 shadow-[0_1px_1px_rgba(20,36,28,0.08)]">
                  <Dot /> <Dot d={0.15} /> <Dot d={0.3} />
                </div>
              </div>
            )}
          </div>

          {/* chips */}
          {chips.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-1.5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => submit(c)}
                  disabled={busy}
                  className="shrink-0 whitespace-nowrap rounded-full border border-forest-soft bg-surface px-3 py-1.5 text-xs font-semibold text-forest-deep transition-colors hover:bg-leaf-tint disabled:opacity-50 cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex items-center gap-2 border-t border-line bg-cream-deep/60 px-3 py-2.5"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Type a message…"
              aria-label="Message Farmgate"
              className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus-visible:border-forest"
            />
            <button
              type="submit"
              disabled={busy || !value.trim()}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-white transition-transform duration-150 hover:bg-forest-deep active:scale-90 disabled:opacity-40 cursor-pointer"
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
      className="h-1.5 w-1.5 rounded-full bg-ink-muted/60"
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
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  );
}
