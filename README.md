# komodo-mailgun-alerter

A [Komodo](https://komo.do/) custom alerter that forwards alerts as emails via [Mailgun](https://www.mailgun.com/).

## Environment Variables

| Variable          | Required | Description                                                                           |
| :---------------- | :------- | :------------------------------------------------------------------------------------ |
| `MAILGUN_API_KEY` | Yes      | Your Mailgun API key                                                                  |
| `MAILGUN_DOMAIN`  | Yes      | Your Mailgun sending domain (e.g. `mg.example.com`)                                   |
| `MAILGUN_FROM`    | Yes      | Sender address (e.g. `Komodo Alerts <alerts@mg.example.com>`)                         |
| `MAILGUN_URL`     | No       | Mailgun API base URL. Set to `https://api.eu.mailgun.net` for EU region               |
| `KOMODO_URL`      | No       | Komodo dashboard URL. Adds a link in alert emails (e.g. `https://komodo.example.com`) |
| `PORT`            | No       | HTTP port (default: `8080`)                                                           |

## Setup

### 1. Deploy the alerter

Create a Komodo **Stack** with this compose file (or use `compose.yaml` from this repo):

```yaml
services:
  komodo-mailgun-alerter:
    image: ghcr.io/obusk/komodo-mailgun-alerter:latest
    restart: unless-stopped
    ports:
      - "8080:8080"
```

Add your environment variables in the Stack's **Environment** section:

```env
MAILGUN_API_KEY=[[MAILGUN_API_KEY]]
MAILGUN_DOMAIN=mg.example.com
MAILGUN_FROM=Komodo Alerts <alerts@mg.example.com>
# MAILGUN_URL=https://api.eu.mailgun.net
KOMODO_URL=https://komodo.example.com
```

### 2. Create the alerter in Komodo

Create a new **Alerter** resource with endpoint type **Custom** and set the URL to the alerter's address:

```
http://<host>:8080/?to=recipient@example.com
```

Multiple recipients can be comma-separated:

```
http://<host>:8080/?to=alice@example.com,bob@example.com
```

Replace `<host>` with the IP or hostname of the machine running the alerter.

You can also override the Komodo host url

```
http://<host>:8080/?to=recipient@example.com&komodo_url=https://komodo.example.com
```

### Resource Sync

```toml
[[stack]]
name = "mailgun-alerter"
[stack.config]
repo = "https://github.com/oBusk/komodo-mailgun-alerter"
file_paths = ["compose.yaml"]
environment = """
# Recommended to use Komodo variables for secrets
  MAILGUN_API_KEY = [[MAILGUN_API_KEY]]
  MAILGUN_DOMAIN = mg.example.com
  MAILGUN_FROM = Komodo Alerts <alerts@mg.example.com>
  MAILGUN_URL = https://api.eu.mailgun.net
  KOMODO_URL = https://komodo.example.com
"""

[[variable]]
name = "MAILGUN_API_KEY"
value = "your-mailgun-api-key"
is_secret = true

[[alerter]]
name = "Mailgun"
[alerter.config]
[alerter.config.endpoint]
type = "Custom"
[alerter.config.endpoint.params]
url = "http://<host>:8080/?to=recipient@example.com"
```

## Development

```sh
bun install
bun dev        # start with --watch
bun test
bun run typecheck
bun preview    # email template preview at http://localhost:3001
```

## License

[MIT](LICENSE) © [oBusk](https://github.com/oBusk)
