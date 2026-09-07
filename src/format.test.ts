import { test, expect, describe } from "bun:test";
import type { Types } from "komodo_client";
type Alert = Types.Alert;
import { formatAlert } from "./format.ts";

function makeAlert(overrides: Partial<Alert> & { data: Alert["data"] }): Alert {
  return {
    ts: 1725494400000,
    resolved: false,
    level: "WARNING" as Types.SeverityLevel,
    target: { type: "Server", id: "srv-1" },
    ...overrides,
  };
}

describe("subject", () => {
  test("includes severity level", () => {
    const result = formatAlert(
      makeAlert({
        level: "CRITICAL" as Types.SeverityLevel,
        data: {
          type: "ServerCpu",
          data: { id: "1", name: "web-01", percentage: 95 },
        },
      }),
    );
    expect(result.subject).toBe("[CRITICAL] ServerCpu - web-01");
  });

  test("resolved overrides level", () => {
    const result = formatAlert(
      makeAlert({
        level: "CRITICAL" as Types.SeverityLevel,
        resolved: true,
        data: {
          type: "ServerCpu",
          data: { id: "1", name: "web-01", percentage: 95 },
        },
      }),
    );
    expect(result.subject).toBe("[RESOLVED] ServerCpu - web-01");
  });

  test("OK level", () => {
    const result = formatAlert(
      makeAlert({
        level: "OK" as Types.SeverityLevel,
        data: { type: "Test", data: { id: "1", name: "my-alerter" } },
      }),
    );
    expect(result.subject).toBe("[OK] Test - my-alerter");
  });
});

describe("ServerCpu", () => {
  test("formats percentage and name", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "ServerCpu",
          data: { id: "1", name: "prod-01", percentage: 87.187 },
        },
      }),
    );
    expect(result.text).toContain("87.2%");
    expect(result.text).toContain("prod-01");
  });

  test("includes region when present", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "ServerCpu",
          data: {
            id: "1",
            name: "prod-01",
            region: "us-east-1",
            percentage: 90,
          },
        },
      }),
    );
    expect(result.text).toContain("us-east-1");
  });
});

describe("ServerMem", () => {
  test("formats used/total and percentage", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "ServerMem",
          data: { id: "1", name: "db-01", used_gb: 14, total_gb: 16 },
        },
      }),
    );
    expect(result.text).toContain("14.0 GB / 16.0 GB");
    expect(result.text).toContain("87.5%");
    expect(result.text).toContain("db-01");
  });
});

describe("ServerDisk", () => {
  test("formats disk info with path", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "ServerDisk",
          data: {
            id: "1",
            name: "srv-1",
            path: "/data",
            used_gb: 80,
            total_gb: 100,
          },
        },
      }),
    );
    expect(result.text).toContain("80.0 GB / 100.0 GB");
    expect(result.text).toContain("/data");
  });
});

describe("ContainerStateChange", () => {
  test("shows from/to states and server", () => {
    const result = formatAlert(
      makeAlert({
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
      }),
    );
    expect(result.text).toContain("nginx");
    expect(result.text).toContain("running");
    expect(result.text).toContain("exited");
    expect(result.text).toContain("web-01");
  });
});

describe("StackStateChange", () => {
  test("shows from/to states", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "StackStateChange",
          data: {
            id: "1",
            name: "monitoring",
            from: "running" as never,
            to: "down" as never,
          },
        },
      }),
    );
    expect(result.text).toContain("monitoring");
    expect(result.text).toContain("running");
    expect(result.text).toContain("down");
  });
});

describe("BuildFailed", () => {
  test("includes name and version", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "BuildFailed",
          data: {
            id: "1",
            name: "api-server",
            version: { major: 2, minor: 1, patch: 0 },
          },
        },
      }),
    );
    expect(result.text).toContain("api-server");
    expect(result.text).toContain("v2.1.0");
  });
});

describe("Custom", () => {
  test("uses message field", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "Custom",
          data: { message: "Deployment timed out" },
        },
      }),
    );
    expect(result.text).toContain("Deployment timed out");
  });

  test("includes details when present", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "Custom",
          data: { message: "Alert", details: "Extra info here" },
        },
      }),
    );
    expect(result.text).toContain("Extra info here");
  });
});

describe("Test alert", () => {
  test("formats test alert", () => {
    const result = formatAlert(
      makeAlert({
        data: { type: "Test", data: { id: "1", name: "my-alerter" } },
      }),
    );
    expect(result.text).toContain("Test alert");
    expect(result.text).toContain("my-alerter");
  });
});

describe("None", () => {
  test("handles None type", () => {
    const result = formatAlert(
      makeAlert({
        data: { type: "None", data: {} },
      }),
    );
    expect(result.subject).toContain("None");
    expect(result.text).toContain("No alert data");
  });
});

describe("HTML output", () => {
  test("contains severity color for CRITICAL", () => {
    const result = formatAlert(
      makeAlert({
        level: "CRITICAL" as Types.SeverityLevel,
        data: { type: "Test", data: { id: "1", name: "test" } },
      }),
    );
    expect(result.html).toContain("#dc2626");
  });

  test("uses green for resolved", () => {
    const result = formatAlert(
      makeAlert({
        level: "CRITICAL" as Types.SeverityLevel,
        resolved: true,
        data: { type: "Test", data: { id: "1", name: "test" } },
      }),
    );
    expect(result.html).toContain("#16a34a");
    expect(result.html).toContain("RESOLVED");
  });

  test("escapes HTML in content", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "Custom",
          data: { message: '<script>alert("xss")</script>' },
        },
      }),
    );
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
  });
});

describe("text output", () => {
  test("contains no HTML tags", () => {
    const result = formatAlert(
      makeAlert({
        data: {
          type: "ServerCpu",
          data: { id: "1", name: "web-01", percentage: 80 },
        },
      }),
    );
    expect(result.text).not.toMatch(/<[a-z][^>]*>/i);
  });

  test("contains timestamp", () => {
    const result = formatAlert(
      makeAlert({
        ts: 1725494400000,
        data: { type: "Test", data: { id: "1", name: "test" } },
      }),
    );
    expect(result.text).toContain("2024-09-05");
  });
});
