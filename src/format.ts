import type { Types } from "komodo_client";
import { EmailTemplate } from "./email-template.tsx";

type Alert = Types.Alert;
type AlertData = Types.AlertData;
type SeverityLevel = Types.SeverityLevel;

export interface FormattedAlert {
  subject: string;
  text: string;
  html: string;
}

export function formatAlert(alert: Alert): FormattedAlert {
  const subject = formatSubject(alert);
  const body = formatData(alert.data);
  const timestamp = new Date(alert.ts).toISOString();
  const resourceType = alert.target.type;

  const text = [
    alert.resolved ? "RESOLVED" : alert.level,
    "",
    body,
    "",
    `Resource: ${resourceType} (${alert.target.id})`,
    `Time: ${timestamp}`,
  ].join("\n");

  const color = severityColor(alert.resolved ? "OK" : alert.level);
  const label = alert.resolved ? "RESOLVED" : alert.level;

  const html =
    "<!DOCTYPE html>" +
    EmailTemplate({
      color,
      label,
      header: formatSubjectContent(alert),
      body,
      resourceType,
      timestamp,
    });

  return { subject, text, html };
}

function formatSubject(alert: Alert): string {
  return `${formatSubjectPrefix(alert)} ${formatSubjectContent(alert)}`;
}

function formatSubjectPrefix(alert: Alert): string {
  return alert.resolved ? "[RESOLVED]" : `[${alert.level}]`;
}

function formatSubjectContent(alert: Alert): string {
  const name = extractName(alert.data);
  if (name) return `${alert.data.type} - ${name}`;
  return alert.data.type;
}

function extractName(data: AlertData): string | undefined {
  if ("data" in data && data.data && "name" in data.data) {
    return data.data.name;
  }
  return undefined;
}

function formatData(data: AlertData): string {
  switch (data.type) {
    case "ServerCpu": {
      const d = data.data;
      const region = d.region ? ` (${d.region})` : "";
      return `CPU usage at ${d.percentage.toFixed(1)}% on ${d.name}${region}`;
    }
    case "ServerMem": {
      const d = data.data;
      const pct = ((d.used_gb / d.total_gb) * 100).toFixed(1);
      const region = d.region ? ` (${d.region})` : "";
      return `Memory: ${d.used_gb.toFixed(1)} GB / ${d.total_gb.toFixed(1)} GB (${pct}%) on ${d.name}${region}`;
    }
    case "ServerDisk": {
      const d = data.data;
      const pct = ((d.used_gb / d.total_gb) * 100).toFixed(1);
      const region = d.region ? ` (${d.region})` : "";
      return `Disk: ${d.used_gb.toFixed(1)} GB / ${d.total_gb.toFixed(1)} GB (${pct}%) on ${d.name}${region}\nMount: ${d.path}`;
    }
    case "ServerUnreachable": {
      const d = data.data;
      const region = d.region ? ` (${d.region})` : "";
      const err = d.err ? `\nError: ${d.err.error}` : "";
      return `Server ${d.name}${region} is unreachable${err}`;
    }
    case "ServerVersionMismatch": {
      const d = data.data;
      return `Server ${d.name} version mismatch: server=${d.server_version}, core=${d.core_version}`;
    }
    case "SwarmUnhealthy": {
      const d = data.data;
      const err = d.err ? `\nError: ${d.err.error}` : "";
      return `Swarm ${d.name} is unhealthy${err}`;
    }
    case "ContainerStateChange": {
      const d = data.data;
      const on = d.server_name
        ? ` on ${d.server_name}`
        : d.swarm_name
          ? ` on swarm ${d.swarm_name}`
          : "";
      return `Container ${d.name} changed state: ${d.from} → ${d.to}${on}`;
    }
    case "StackStateChange": {
      const d = data.data;
      const on = d.server_name
        ? ` on ${d.server_name}`
        : d.swarm_name
          ? ` on swarm ${d.swarm_name}`
          : "";
      return `Stack ${d.name} changed state: ${d.from} → ${d.to}${on}`;
    }
    case "DeploymentImageUpdateAvailable": {
      const d = data.data;
      const on = d.server_name ? ` on ${d.server_name}` : "";
      return `New image available for deployment ${d.name}${on}: ${d.image}`;
    }
    case "DeploymentAutoUpdated": {
      const d = data.data;
      const on = d.server_name ? ` on ${d.server_name}` : "";
      return `Deployment ${d.name}${on} auto-updated to: ${d.image}`;
    }
    case "StackImageUpdateAvailable": {
      const d = data.data;
      const on = d.server_name ? ` on ${d.server_name}` : "";
      return `New image available for stack ${d.name}${on}, service ${d.service}: ${d.image}`;
    }
    case "StackAutoUpdated": {
      const d = data.data;
      const on = d.server_name ? ` on ${d.server_name}` : "";
      return `Stack ${d.name}${on} auto-updated images:\n${d.images.join("\n")}`;
    }
    case "BuildFailed": {
      const d = data.data;
      return `Build ${d.name} failed (v${d.version.major}.${d.version.minor}.${d.version.patch})`;
    }
    case "RepoBuildFailed":
      return `Repo build failed: ${data.data.name}`;
    case "ProcedureFailed":
      return `Procedure failed: ${data.data.name}`;
    case "ActionFailed":
      return `Action failed: ${data.data.name}`;
    case "AwsBuilderTerminationFailed":
      return `AWS builder termination failed for instance ${data.data.instance_id}: ${data.data.message}`;
    case "ResourceSyncPendingUpdates":
      return `Resource sync ${data.data.name} has pending updates`;
    case "ScheduleRun":
      return `Scheduled ${data.data.resource_type} run: ${data.data.name}`;
    case "Test":
      return `Test alert from alerter: ${data.data.name}`;
    case "Custom":
      return data.data.details
        ? `${data.data.message}\n\n${data.data.details}`
        : data.data.message;
    case "None":
      return "No alert data";
    default:
      return JSON.stringify((data satisfies never as AlertData).data, null, 2);
  }
}

function severityColor(level: SeverityLevel | string): string {
  switch (level) {
    case "CRITICAL":
      return "#dc2626";
    case "WARNING":
      return "#d97706";
    case "OK":
      return "#16a34a";
    default:
      return "#6b7280";
  }
}
