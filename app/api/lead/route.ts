import { NextResponse } from "next/server";

/* ---------------------------------------------------------------------------
   Test-drive lead intake.

   The browser posts here, never straight to GoHighLevel, so the webhook URL
   stays a server-side secret and the visitor never sees a cross-origin failure.

   With GHL_LEAD_WEBHOOK_URL set, the lead is forwarded and a delivery failure
   is a real 502 the form surfaces. With it unset (local dev, preview deploys),
   the lead is logged server-side and accepted — nothing is silently dropped
   without a record, and the visitor still gets an honest confirmation.
--------------------------------------------------------------------------- */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 16 * 1024;

/** Trim every string, cap its length, and keep only the fields we expect. */
function clean(value: unknown, max = 500) {
  if (typeof value === "string") return value.trim().slice(0, max);
  if (typeof value === "boolean" || typeof value === "number") return value;
  return "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    const text = await request.text();
    if (text.length > MAX_BODY) {
      return NextResponse.json({ ok: false, error: "payload too large" }, { status: 413 });
    }
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const name = String(clean(body.name, 120));
  const phone = String(clean(body.phone, 40));

  if (!name || phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "name and a valid phone are required" }, { status: 422 });
  }

  const lead = {
    name,
    first_name: clean(body.first_name, 60),
    last_name: clean(body.last_name, 60),
    phone,
    email: clean(body.email, 160),
    language: clean(body.language, 8),
    vehicle: clean(body.vehicle, 200),
    when: clean(body.when, 200),
    sms_marketing: body.sms_marketing === true,
    sms_nonmarketing: body.sms_nonmarketing === true,
    sms_marketing_consent_text: clean(body.sms_marketing_consent_text, 1000),
    sms_nonmarketing_consent_text: clean(body.sms_nonmarketing_consent_text, 1000),
    consent_captured_at: clean(body.consent_captured_at, 40),
    source: clean(body.source, 120),
    form: clean(body.form, 60),
    page_url: clean(body.page_url, 500),
    referrer: clean(body.referrer, 500),
    submitted_at: clean(body.submitted_at, 40),
    // Ad attribution, whatever the page picked up off the query string.
    utm_source: clean(body.utm_source, 120),
    utm_medium: clean(body.utm_medium, 120),
    utm_campaign: clean(body.utm_campaign, 200),
    utm_term: clean(body.utm_term, 200),
    utm_content: clean(body.utm_content, 200),
    gclid: clean(body.gclid, 200),
    fbclid: clean(body.fbclid, 200),
    received_at: new Date().toISOString(),
  };

  const webhook = process.env.GHL_LEAD_WEBHOOK_URL;

  if (!webhook) {
    console.info(
      "[lead] GHL_LEAD_WEBHOOK_URL is not set — the lead was recorded in the server log only:",
      lead
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.error("[lead] webhook responded", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ ok: false, error: "delivery failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    // Log the whole lead so a delivery outage never loses a customer.
    console.error("[lead] webhook error", err, lead);
    return NextResponse.json({ ok: false, error: "delivery failed" }, { status: 502 });
  }
}
