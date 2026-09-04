import type { Types } from "komodo_client";
import Mailgun from "mailgun.js";
import { formatAlert } from "./format.ts";

const MAILGUN_API_KEY = requireEnv("MAILGUN_API_KEY");
const MAILGUN_DOMAIN = requireEnv("MAILGUN_DOMAIN");
const MAILGUN_FROM = requireEnv("MAILGUN_FROM");

const mg = new Mailgun(FormData).client({
  username: "api",
  key: MAILGUN_API_KEY,
  url: process.env.MAILGUN_URL,
});

const PORT = Number(process.env.PORT) || 3000;

Bun.serve({
  port: PORT,
  routes: {
    "/": {
      GET: () => Response.json({ status: "ok" }),
      POST: async (req) => {
        const to = parseRecipients(req.url);
        if (!to) {
          return Response.json(
            { error: 'Missing "to" query parameter' },
            { status: 400 },
          );
        }

        let alert: Types.Alert;
        try {
          alert = (await req.json()) as Types.Alert;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { subject, text, html } = formatAlert(alert);

        try {
          await mg.messages.create(MAILGUN_DOMAIN, {
            from: MAILGUN_FROM,
            to,
            subject,
            text,
            html,
          });
        } catch (err) {
          console.error("Mailgun send failed:", err);
          return Response.json(
            { error: "Failed to send email" },
            { status: 500 },
          );
        }

        return Response.json({ success: true });
      },
    },
  },
  fetch() {
    return Response.json({ error: "Not found" }, { status: 404 });
  },
  error(error) {
    console.error("Unhandled error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  },
});

console.log(`komodo-mailgun-alerter listening on port ${PORT}`);

function parseRecipients(url: string): string[] | null {
  const param = new URL(url).searchParams.get("to");
  if (!param) return null;
  const recipients = param
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  return recipients.length > 0 ? recipients : null;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
