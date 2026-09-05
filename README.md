# komodo-mailgun-alerter

A [Komodo](https://komo.do/) custom alerter that forwards alerts as emails via [Mailgun](https://www.mailgun.com/).

## Requirements

- A Mailgun account with a verified sending domain
- A Mailgun API key
- A running Komodo instance

## Environment Variables

| Variable          | Required | Description                                                             |
| :---------------- | :------- | :---------------------------------------------------------------------- |
| `MAILGUN_API_KEY` | Yes      | Your Mailgun API key                                                    |
| `MAILGUN_DOMAIN`  | Yes      | Your Mailgun sending domain (e.g. `komodo.example.com`)                 |
| `MAILGUN_FROM`    | Yes      | Sender address (e.g. `Komodo Alerts <alerts@komodo.example.com>`)       |
| `MAILGUN_URL`     | No       | Mailgun API base URL. Set to `https://api.eu.mailgun.net` for EU region |
| `PORT`            | No       | HTTP port (default: `8080`)                                             |

## Deployment

1. Create a new **Stack**

   - Either UI defined

     Compose file:

     ```yaml
     services:
       komodo-mailgun-alerter:
         image: ghcr.io/obusk/komodo-mailgun-alerter:latest
         container_name: komodo-mailgun-alerter
         restart: unless-stopped
     ```

   - Or Git Repo

     - Git Provider: github.com
     - Repo: oBusk/komodo-mailgun-alerter
     - Branch: main

2. Add your environment variables in the Stack's **Environment** section:

```env
# Recommended to use Komodo variables for secrets
MAILGUN_API_KEY=[[MAILGUN_API_KEY]]
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM=Komodo Alerts <alerts@mg.yourdomain.com>
MAILGUN_URL=https://api.eu.mailgun.net
```

3. Deploy the Stack.

4. In the Komodo dashboard, create a new **Alerter** resource with endpoint type **Custom** and set the URL:

```
http://komodo-mailgun-alerter:8080/?to=recipient@example.com

```

Multiple recipients can be separated with commas:

```
http://komodo-mailgun-alerter:8080/?to=alice@example.com,bob@example.com

```

## Resource Sync

Template for setting up via Komodo's Resource Sync feature:

```toml
[[stack]]
name = "mailgun-alerter"
[stack.config]
repo = "https://github.com/oBusk/komodo-mailgun-alerter"
file_paths = ["compose.yml"]
environment = """
  # Recommended to use Komodo variables for secrets
  MAILGUN_API_KEY = [[MAILGUN_API_KEY]]
  MAILGUN_DOMAIN = komodo.example.com
  MAILGUN_FROM = Komodo Alerts <alerts@komodo.example.com>
  MAILGUN_URL = https://api.mailgun.net
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
url = "http://komodo-mailgun-alerter:8080/?to=alert.receiver@example.com"
```

## Development

```sh
bun install
bun dev        # start with --watch
bun test       # run tests
bun run typecheck

```

## License

[MIT](LICENSE) © [oBusk](https://github.com/oBusk)
