"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CircleCheckBig } from "lucide-react";

import { dealer, site } from "@/lib/config";

/* SMS consent — carrier-required language for A2P registration. Keep verbatim,
   and keep the exact string that was on screen: it is what gets stored as the
   consent record. */
const SMS_MARKETING_CONSENT = `I consent to receive marketing text messages about special offers, discounts, and service updates from ${dealer.name} at the phone number provided. Message frequency may vary. Message and data rates may apply. Text HELP for assistance, reply STOP to opt out.`;

const SMS_NONMARKETING_CONSENT = `I consent to receive non-marketing text messages from ${dealer.name} about vehicle inquiries, vehicle availability, financing updates, appointment reminders, and service-related updates. Message frequency may vary. Message and data rates may apply. Text HELP for assistance, reply STOP to opt out.`;

const COPY = {
  missing: "Add your name and phone so we can confirm the time.",
  phone: "That phone number looks short — check it and try again.",
  failed: "That didn't go through. Call or WhatsApp us and we'll book it by hand.",
};

const FIELD =
  "w-full rounded-md border border-white/15 bg-asphalt px-4 py-3 text-white placeholder-smoke focus:border-brand focus:outline-none";

/** utm_*, gclid and fbclid off the current URL, for lead attribution. */
function attribution() {
  const out: Record<string, string> = {};
  try {
    new URLSearchParams(window.location.search).forEach((v, k) => {
      if (/^utm_/i.test(k) || k === "gclid" || k === "fbclid") out[k] = v;
    });
  } catch {
    /* never block a lead over attribution */
  }
  return out;
}

export default function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    if (!name || !phone) {
      setError(COPY.missing);
      (form.elements.namedItem(name ? "phone" : "name") as HTMLInputElement | null)?.focus();
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setError(COPY.phone);
      (form.elements.namedItem("phone") as HTMLInputElement | null)?.focus();
      return;
    }

    const marketing = fd.get("sms_marketing") === "yes";
    const nonMarketing = fd.get("sms_nonmarketing") === "yes";

    const payload = {
      name,
      first_name: name.split(/\s+/)[0],
      last_name: name.split(/\s+/).slice(1).join(" "),
      phone,
      email: String(fd.get("email") ?? "").trim(),
      language: String(fd.get("language") ?? "en"),
      vehicle: String(fd.get("vehicle") ?? "").trim(),
      when: String(fd.get("when") ?? "").trim(),
      sms_marketing: marketing,
      sms_nonmarketing: nonMarketing,
      // Snapshot of exactly what was agreed to, for the A2P consent record.
      sms_marketing_consent_text: marketing ? SMS_MARKETING_CONSENT : "",
      sms_nonmarketing_consent_text: nonMarketing ? SMS_NONMARKETING_CONSENT : "",
      consent_captured_at: new Date().toISOString(),
      source: site.leadSource,
      form: "test-drive",
      page_url: window.location.href,
      referrer: document.referrer || "",
      submitted_at: new Date().toISOString(),
      ...attribution(),
    };

    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`lead endpoint responded ${res.status}`);

      setDone(true);
      window.dataLayer?.push({ event: "lead_submitted", form: "test-drive" });
      requestAnimationFrame(() => {
        successRef.current?.focus();
        successRef.current?.scrollIntoView({ block: "center" });
      });
    } catch (err) {
      console.error("[lead]", err);
      setError(COPY.failed);
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="test-drive" className="hatch py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="rounded-lg border border-white/10 bg-tarmac p-7 sm:p-10">
          <h2 className="font-display text-4xl font-black uppercase leading-none text-white sm:text-5xl">
            Book a test drive
          </h2>
          <p className="mt-3 text-steel">
            Tell us which vehicle and when. We&apos;ll have it pulled up front and ready when you
            arrive. Reserva tu prueba de manejo — te atendemos en español.
          </p>

          {done ? (
            <div
              ref={successRef}
              tabIndex={-1}
              className="mt-8 rounded-md border border-brand/40 bg-brand/10 p-8 text-center"
            >
              <CircleCheckBig className="mx-auto h-12 w-12 text-brand" aria-hidden="true" />
              <h3 className="mt-4 font-display text-3xl font-bold uppercase text-white">
                Test drive booked
              </h3>
              <p className="mt-2 text-steel">
                We&apos;ll confirm by text or call shortly and have the vehicle ready when you arrive.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={dealer.dc.inventory}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-white/30 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-white hover:bg-white/5"
                >
                  Keep browsing
                </a>
                <button
                  type="button"
                  onClick={() => {
                    formRef.current?.reset();
                    setDone(false);
                  }}
                  className="rounded-md border border-white/30 px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-white hover:bg-white/5"
                >
                  Book another
                </button>
              </div>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="lead-name" className="mb-2 block text-sm font-semibold text-chalk">
                    Full name
                  </label>
                  <input
                    id="lead-name"
                    name="name"
                    autoComplete="name"
                    required
                    aria-required="true"
                    className={FIELD}
                    placeholder="Carlos Rivera"
                  />
                </div>
                <div>
                  <label htmlFor="lead-phone" className="mb-2 block text-sm font-semibold text-chalk">
                    Phone
                  </label>
                  <input
                    id="lead-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    aria-required="true"
                    className={FIELD}
                    placeholder="(321) 555-0100"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="lead-email" className="mb-2 block text-sm font-semibold text-chalk">
                    Email
                  </label>
                  <input
                    id="lead-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={FIELD}
                    placeholder="carlos@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lead-language"
                    className="mb-2 block text-sm font-semibold text-chalk"
                  >
                    Preferred language
                  </label>
                  <select
                    id="lead-language"
                    name="language"
                    defaultValue="en"
                    className="w-full rounded-md border border-white/15 bg-asphalt px-4 py-3 text-white focus:border-brand focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="lead-vehicle" className="mb-2 block text-sm font-semibold text-chalk">
                  Which vehicle?
                </label>
                <input
                  id="lead-vehicle"
                  name="vehicle"
                  className={FIELD}
                  placeholder="e.g. 2019 F-150, a lifted Jeep, or anything under $10K"
                />
              </div>

              <div>
                <label htmlFor="lead-when" className="mb-2 block text-sm font-semibold text-chalk">
                  When works for you?
                </label>
                <input
                  id="lead-when"
                  name="when"
                  className={FIELD}
                  placeholder="Saturday afternoon, tomorrow after 5, etc."
                />
              </div>

              <fieldset className="space-y-3 rounded-md border border-white/10 bg-asphalt p-5">
                <legend className="sr-only">Text message consent</legend>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="lead-sms-marketing"
                    name="sms_marketing"
                    value="yes"
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
                  <label
                    htmlFor="lead-sms-marketing"
                    className="text-sm leading-relaxed text-steel"
                  >
                    {SMS_MARKETING_CONSENT}
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="lead-sms-nonmarketing"
                    name="sms_nonmarketing"
                    value="yes"
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
                  <label
                    htmlFor="lead-sms-nonmarketing"
                    className="text-sm leading-relaxed text-steel"
                  >
                    {SMS_NONMARKETING_CONSENT}
                  </label>
                </div>
              </fieldset>

              <p role="alert" aria-live="polite" className="text-sm text-red-300">
                {error}
              </p>

              <button
                type="submit"
                disabled={sending}
                className="brand-btn w-full rounded-md px-6 py-4 font-display text-xl font-bold uppercase tracking-wide text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? "Sending…" : "Book my test drive"}
              </button>

              <p className="text-center text-xs leading-relaxed text-smoke">
                By submitting, you consent to be contacted by {dealer.name} via call and email
                regarding your inquiry. SMS consent is optional and not required to submit this form.
                Consent is not a condition of purchase. See our{" "}
                <Link href="/privacy-policy" className="underline hover:text-chalk">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/sms-disclosure" className="underline hover:text-chalk">
                  SMS Disclosure
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
