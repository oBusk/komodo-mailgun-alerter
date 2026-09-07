interface EmailTemplateProps {
  color: string;
  label: string;
  header: string;
  body: string;
  resourceType: string;
  timestamp: string;
  komodoUrl?: string;
}

export function EmailTemplate({
  color,
  label,
  header,
  body,
  resourceType,
  timestamp,
  komodoUrl,
}: EmailTemplateProps): string {
  return (
    <html>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui,-apple-system,sans-serif",
        }}
      >
        <div
          safe
          style={{
            background: color,
            color: "#fff",
            padding: "12px 16px",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {label}
        </div>
        <div style={{ padding: "16px" }}>
          <h2 safe style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
            {header}
          </h2>
          <p safe style={{ margin: "0 0 16px 0", whiteSpace: "pre-line" }}>
            {body}
          </p>
          <table style={{ fontSize: "13px", color: "#666" }}>
            <tbody>
              <tr>
                <td style={{ paddingRight: "8px" }}>Resource</td>
                <td safe>{resourceType}</td>
              </tr>
              <tr>
                <td style={{ paddingRight: "8px" }}>Time</td>
                <td safe>{timestamp}</td>
              </tr>
            </tbody>
          </table>
          {komodoUrl ? (
            <p style={{ margin: "16px 0 0 0", fontSize: "13px" }}>
              <a safe href={komodoUrl} style={{ color: "#2563eb" }}>
                {komodoUrl}
              </a>
            </p>
          ) : (
            <></>
          )}
        </div>
      </body>
    </html>
  ) as string;
}
