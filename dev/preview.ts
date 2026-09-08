// Local email preview server — run with `bun preview` and open http://localhost:3001
import { Types } from "komodo_client";
import { formatAlert } from "../src/format.ts";

type Alert = Types.Alert;
const L = Types.SeverityLevel;

const sampleAlerts: { label: string; alert: Alert; komodoUrl?: string }[] = [
  {
    label: "CPU Critical",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Critical,
      target: { type: "Server", id: "srv-1" },
      data: {
        type: "ServerCpu",
        data: {
          id: "1",
          name: "prod-web-01",
          region: "eu-north-1",
          percentage: 97.3,
        },
      },
    },
    komodoUrl: "https://komodo.example.com",
  },
  {
    label: "CPU Resolved",
    alert: {
      ts: Date.now(),
      resolved: true,
      level: L.Ok,
      target: { type: "Server", id: "srv-1" },
      data: {
        type: "ServerCpu",
        data: { id: "1", name: "prod-web-01", percentage: 42.1 },
      },
    },
    komodoUrl: "https://komodo.example.com",
  },
  {
    label: "Memory Warning",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Warning,
      target: { type: "Server", id: "srv-2" },
      data: {
        type: "ServerMem",
        data: { id: "2", name: "db-01", used_gb: 14.2, total_gb: 16 },
      },
    },
  },
  {
    label: "Disk Warning",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Warning,
      target: { type: "Server", id: "srv-3" },
      data: {
        type: "ServerDisk",
        data: {
          id: "3",
          name: "storage-01",
          path: "/data",
          used_gb: 450,
          total_gb: 500,
        },
      },
    },
  },
  {
    label: "Container State Change (Warning)",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Warning,
      target: { type: "Deployment", id: "dep-1" },
      data: {
        type: "ContainerStateChange",
        data: {
          id: "1",
          name: "nginx",
          server_name: "web-01",
          from: "running" as never,
          to: "exited" as never,
        },
      },
    },
    komodoUrl: "https://komodo.example.com",
  },
  {
    label: "Stack State Change (OK)",
    alert: {
      ts: Date.now(),
      resolved: true,
      level: L.Ok,
      target: { type: "Stack", id: "stk-1" },
      data: {
        type: "StackStateChange",
        data: {
          id: "1",
          name: "monitoring",
          server_name: "Nyxondra",
          from: "restarting" as never,
          to: "running" as never,
        },
      },
    },
    komodoUrl: "https://komodo.example.com",
  },
  {
    label: "Build Failed",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Critical,
      target: { type: "Build", id: "bld-1" },
      data: {
        type: "BuildFailed",
        data: {
          id: "1",
          name: "api-server",
          version: { major: 2, minor: 1, patch: 0 },
        },
      },
    },
    komodoUrl: "https://komodo.example.com",
  },
  {
    label: "Image Update Available",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Ok,
      target: { type: "Stack", id: "stk-2" },
      data: {
        type: "StackImageUpdateAvailable",
        data: {
          id: "2",
          name: "wp-obusk-se",
          server_name: "web-01",
          service: "wordpress",
          image: "wordpress:6.7-php8.3",
        },
      },
    },
  },
  {
    label: "Scheduled Run",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Ok,
      target: { type: "Procedure", id: "proc-1" },
      data: {
        type: "ScheduleRun",
        data: {
          id: "1",
          name: "Global Auto Update",
          resource_type: "Procedure" as never,
        },
      },
    },
  },
  {
    label: "Custom Alert",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Warning,
      target: { type: "Server", id: "srv-1" },
      data: {
        type: "Custom",
        data: {
          message: "Deployment timed out after 5 minutes",
          details:
            "Service api-server failed health check on port 8080.\nLast log: connection refused",
        },
      },
    },
  },
  {
    label: "Test Alert",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Ok,
      target: { type: "Server", id: "srv-1" },
      data: {
        type: "Test",
        data: { id: "1", name: "mailgun-alerter" },
      },
    },
  },
  {
    label: "Server Unreachable",
    alert: {
      ts: Date.now(),
      resolved: false,
      level: L.Critical,
      target: { type: "Server", id: "srv-4" },
      data: {
        type: "ServerUnreachable",
        data: {
          id: "4",
          name: "worker-03",
          region: "us-east-1",
          err: { error: "connection timed out after 30s", trace: [] },
        },
      },
    },
    komodoUrl: "https://komodo.example.com",
  },
];

const PORT = 3001;
const INSTANCE_ID = crypto.randomUUID();

function renderGallery(): string {
  const cards = sampleAlerts.map(({ label, alert, komodoUrl }) => {
    const { subject, html, text } = formatAlert(alert, { komodoUrl });
    return `
      <div style="margin-bottom: 40px;">
        <h2 style="font-family: system-ui; margin: 0 0 4px 0; font-size: 14px; color: #666;">
          ${label}
        </h2>
        <div style="font-family: monospace; font-size: 12px; color: #999; margin-bottom: 8px;">
          Subject: ${subject}
        </div>
        <div style="border: 1px solid #ddd; border-radius: 4px; overflow: hidden; max-width: 600px;">
          <iframe
            srcdoc="${html.replace(/"/g, "&quot;")}"
            style="width: 100%; height: 300px; border: none;"
          ></iframe>
        </div>
        <details style="margin-top: 8px; font-family: monospace; font-size: 12px;">
          <summary style="cursor: pointer; color: #666;">Plain text version</summary>
          <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; white-space: pre-wrap;">${text}</pre>
        </details>
      </div>
    `;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Preview</title>
  <style>
    body { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: system-ui; background: #fafafa; }
    h1 { font-size: 20px; color: #333; margin-bottom: 32px; }
  </style>
</head>
<body>
  <script>setInterval(async()=>{try{const r=await fetch("/__id");if(await r.text()!=="${INSTANCE_ID}")location.reload()}catch{}},500)</script>
  <h1>Email Preview (${sampleAlerts.length} alerts)</h1>
  ${cards.join("")}
</body>
</html>`;
}

Bun.serve({
  port: PORT,
  routes: {
    "/": () =>
      new Response(renderGallery(), {
        headers: { "Content-Type": "text/html" },
      }),
    "/__id": () => new Response(INSTANCE_ID),
  },
  fetch() {
    return Response.redirect("/");
  },
});

console.log(`Email preview: http://localhost:${PORT}`);
