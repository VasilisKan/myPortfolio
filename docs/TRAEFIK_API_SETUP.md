# Traefik API Setup

Expose your backend API at `https://api.kanellos.me` via Traefik.

## Prerequisites

- Backend running on port 5000 on the host (e.g. `python -m uvicorn ...` or Node/Express)
- DNS: `api.kanellos.me` → your server IP
- HTTPS: use Traefik with TLS (or a reverse proxy in front) if needed

## Setup

1. **Dynamic config** – The dynamic configuration is located in the root `traefik/dynamic/api.yml`. It routes `api.kanellos.me` → `host.docker.internal:5000`.

2. **docker-compose.yml** – Traefik is now in a standalone folder:
   - Root `traefik/docker-compose.yml` manages the Traefik service.
   - It includes the file provider for `dynamic/` and `extra_hosts` for host connectivity.

3. **Restart the stack:**

   ```bash
   cd traefik
   docker compose up -d
   cd ../myPortfolio
   docker compose up -d
   ```

4. **Verify:** `curl https://api.kanellos.me/api/auth/me` (or your API root).

## Linux note

`host.docker.internal` is emulated via `extra_hosts: host.docker.internal:host-gateway`. Docker 20.10+ required.
