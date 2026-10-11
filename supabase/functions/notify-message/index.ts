import { createClient } from "jsr:@supabase/supabase-js@2";

const SITE_URL = (Deno.env.get("MESSAGE_EMAIL_SITE_URL") ?? "https://housemates.ng").replace(/\/$/, "");

type DueJob = {
  job_id: string;
  claim_token: string;
  conversation_id: string;
  message_id: string;
  recipient_email: string;
  recipient_name: string | null;
  sender_name: string | null;
  listing_title: string | null;
  message_type: string | null;
  message_preview: string | null;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const cronSecret = Deno.env.get("MESSAGE_EMAIL_SECRET") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const headerSecret = req.headers.get("x-message-email-secret") ?? "";
  const authorization = req.headers.get("authorization") ?? "";
  const allowed =
    (cronSecret.length > 0 && headerSecret === cronSecret) ||
    (serviceKey.length > 0 && authorization === `Bearer ${serviceKey}`);
  if (!allowed) {
    return json({ error: "unauthorized" }, 401);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const from = Deno.env.get("MESSAGE_EMAIL_FROM") ?? "";
  if (!apiKey || !from) {
    return json({ error: "RESEND_API_KEY and MESSAGE_EMAIL_FROM must be set" }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Supabase service credentials are missing" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc("claim_due_message_emails", { batch: 20 });
  if (error) {
    console.error("claim_due_message_emails failed", error.message);
    return json({ error: error.message }, 500);
  }

  const jobs = (data ?? []) as DueJob[];
  let sent = 0;
  let failed = 0;

  for (const job of jobs) {
    const stillDue = await jobStillDue(admin, job);
    if (!stillDue) continue;

    const delivery = await sendMessageEmail(apiKey, from, job);
    if (delivery !== "sent") {
      failed += 1;
      await admin
        .from("message_email_jobs")
        .update(
          delivery === "drop"
            ? {
                skipped_at: new Date().toISOString(),
                skip_reason: "provider",
                claimed_at: null,
                claim_token: null,
                updated_at: new Date().toISOString(),
              }
            : { claimed_at: null, claim_token: null, updated_at: new Date().toISOString() },
        )
        .eq("id", job.job_id)
        .eq("claim_token", job.claim_token);
      continue;
    }

    const { error: markError } = await admin
      .from("message_email_jobs")
      .update({
        sent_at: new Date().toISOString(),
        claimed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.job_id)
      .eq("claim_token", job.claim_token)
      .is("sent_at", null);

    if (markError) {
      console.error("failed to mark message email sent", job.job_id, markError.message);
      failed += 1;
    } else {
      sent += 1;
    }
  }

  return json({ claimed: jobs.length, sent, failed });
});

async function jobStillDue(
  admin: ReturnType<typeof createClient>,
  job: DueJob,
): Promise<boolean> {
  const { data, error } = await admin
    .from("message_email_jobs")
    .select("message_id, send_after")
    .eq("id", job.job_id)
    .eq("claim_token", job.claim_token)
    .is("sent_at", null)
    .is("skipped_at", null)
    .maybeSingle();
  if (error || !data) return false;
  if (data.message_id !== job.message_id) return false;
  return Date.parse(data.send_after) <= Date.now();
}

async function sendMessageEmail(apiKey: string, from: string, job: DueJob): Promise<"sent" | "retry" | "drop"> {
  const sender = firstName(job.sender_name) || "Someone";
  const listing = (job.listing_title || "a listing").trim();
  const link = `${SITE_URL}/messages/${job.conversation_id}`;
  const contactShare = job.message_type === "contact_share";
  const preview = contactShare ? "" : clip(job.message_preview ?? "");
  const subject = `New message from ${sender}`;
  const text = contactShare
    ? `${sender} shared contact details in your chat about ${listing}.\n\nOpen the chat: ${link}`
    : `${sender} sent a message about ${listing}.${preview ? `\n\n"${preview}"` : ""}\n\nOpen the chat: ${link}`;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": job.job_id,
      },
      body: JSON.stringify({
        from,
        to: [job.recipient_email],
        subject,
        text,
        html: renderHtml({ sender, listing, link, preview, contactShare }),
      }),
    });
  } catch (error) {
    console.error("resend request failed", error instanceof Error ? error.message : error);
    return "retry";
  }

  if (!response.ok) {
    const body = await response.text();
    console.error("resend rejected message email", response.status, body.slice(0, 500));
    return response.status === 429 || response.status >= 500 ? "retry" : "drop";
  }
  return "sent";
}

function renderHtml(input: {
  sender: string;
  listing: string;
  link: string;
  preview: string;
  contactShare: boolean;
}): string {
  const sender = escapeHtml(input.sender);
  const listing = escapeHtml(input.listing);
  const link = escapeHtml(input.link);
  const preview = escapeHtml(input.preview);
  const body = input.contactShare
    ? `<p style="margin:0;font-size:15px;line-height:1.6;color:#6B7A85;"><strong style="color:#152028;">${sender}</strong> shared contact details in your chat about <strong style="color:#152028;">${listing}</strong>.</p>`
    : `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#6B7A85;"><strong style="color:#152028;">${sender}</strong> sent a message about <strong style="color:#152028;">${listing}</strong>.</p>` +
      (preview
        ? `<p style="margin:0;font-size:15px;line-height:1.6;color:#152028;">“${preview}”</p>`
        : "");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml("New message from " + input.sender)}</title></head>
<body style="margin:0;padding:0;background-color:#F4F9FA;font-family:'Plus Jakarta Sans',Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${sender} messaged you about ${listing}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F9FA;">
    <tr><td align="center" style="padding:40px 16px 48px;">
      <p style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#152028;">Housemates <span style="color:#13A8BC;">Finder</span></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;border:1px solid #E3E9ED;">
        <tr><td style="height:4px;border-radius:20px 20px 0 0;background:linear-gradient(135deg,#13A8BC 0%,#D94828 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#152028;">New message</h1>
          ${body}
        </td></tr>
        <tr><td align="center" style="padding:28px 32px 32px;">
          <a href="${link}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:12px;background:linear-gradient(135deg,#13A8BC 0%,#D94828 100%);">Open chat</a>
        </td></tr>
      </table>
      <p style="max-width:560px;margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7A85;">You got this because message emails are on for your Housemates Finder account. Turn them off from your profile.</p>
    </td></tr>
  </table>
</body>
</html>`;
}

function firstName(fullName: string | null): string {
  const name = (fullName ?? "").trim();
  if (!name) return "";
  return name.split(/\s+/)[0] ?? "";
}

function clip(value: string): string {
  const flat = value.replace(/\s+/g, " ").trim();
  if (flat.length <= 140) return flat;
  return `${flat.slice(0, 139).trimEnd()}…`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
