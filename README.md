# komodo-mailgun-alerter

A [Komodo](https://komo.do/) custom alerter that forwards alerts as emails via [Mailgun](https://www.mailgun.com/).

## Requirements

- A Mailgun account with a verified sending domain
- A Mailgun API key
- A running Komodo instance

## Environment Variables

| Variable          | Required | Description                                                             |
| ----------------- | -------- | ----------------------------------------------------------------------- |
| `MAILGUN_API_KEY` | Yes      | Your Mailgun API key                                                    |
| `MAILGUN_DOMAIN`  | Yes      | Your Mailgun sending domain (e.g. `mg.yourdomain.com`)                  |
| `MAILGUN_FROM`    | Yes      | Sender address (e.g. `Komodo Alerts <alerts@mg.yourdomain.com>`)        |
| `MAILGUN_URL`     | No       | Mailgun API base URL. Set to `https://api.eu.mailgun.net` for EU region |
| `PORT`            | No       | HTTP port (default: `3000`)                                             |

## Komodo Alerter Setup

In the Komodo dashboard, create a new **Alerter** resource with endpoint type **Custom** and the URL:

```
http://<alerter-host>:3000/?to=recipient@example.com
```

Multiple recipients can be comma-separated:

```
http://<alerter-host>:3000/?to=alice@example.com,bob@example.com
```

You can use Komodo's variable interpolation to keep email addresses in variables:

```
http://<alerter-host>:3000/?to=[[ALERT_EMAILS]]
```

## Deployment

<details>
<summary>Komodo Resource Sync</summary>

Create a Resource Sync in the Komodo dashboard with mode **UI Defined**. Enable **Sync Resources** and **Sync Variables**, then paste:

```toml
[[stack]]
name = "mailgun-alerter"
[stack.config]
repo = "https://github.com/oBusk/komodo-mailgun-alerter"
file_paths = ["compose.yml"]
environment = """
  MAILGUN_API_KEY = [[MAILGUN_API_KEY]]
  MAILGUN_DOMAIN = komodo.example.com
  MAILGUN_FROM = Komodo Alerts <alerts@komodo.example.com>
  ## Optional: uncomment for EU region
  # MAILGUN_URL = https://api.eu.mailgun.net
"""

[[variable]]
name = "MAILGUN_API_KEY"
value = "your-mailgun-api-key"
is_secret = true

[[alerter]]
name = "mailgun"
[alerter.config]
[alerter.config.endpoint]
type = "Custom"
[alerter.config.endpoint.params]
url = "http://mailgun-alerter:3000/?to=alert.reciever@example.com"
```

Save and **Execute Sync**.

</details>

<details>
<summary>Docker Compose (manual)</summary>

1. Create a new **Stack** in Komodo with the following compose config:

```yaml
services:
  komodo-mailgun-alerter:
    image: ghcr.io/obusk/komodo-mailgun-alerter:latest
    container_name: komodo-mailgun-alerter
    restart: unless-stopped
    ports:
      - "3000:3000"
```

2. Add the environment variables to the Stack's **Environment** section:

```
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=komodo.example.com
MAILGUN_FROM=Komodo Alerts <alerts@komodo.example.com>
```

3. Deploy the stack.

4. Create a new **Alerter** resource with endpoint type **Custom** and URL:

```
http://komodo-mailgun-alerter:3000/?to=recipient@example.com
```

5. Optionally configure which **Alert Types** to forward.

6. Click **Test** to verify.

</details>

## Development

```sh
bun install
bun dev        # start with --watch
bun test       # run tests
bun run typecheck
```

## License

[MIT](LICENSE)
