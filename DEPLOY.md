# Container deployment

The complete application stack is defined in `docker-compose.yml`.

## Build and run on one host

1. Create `.env` from `.env.example` and supply production credentials.
2. Build the application images:

   ```bash
   docker compose build
   ```

3. Start the containers:

   ```bash
   docker compose up -d
   ```

4. Check container health and logs:

   ```bash
   docker compose ps
   docker compose logs -f
   ```

The storefront is exposed through `FRONTEND_PORT`, the API through
`GATEWAY_PORT`, and Grafana through `GRAFANA_PORT`.

## Push application images to Amazon ECR

Create one ECR repository for each build-enabled service, preferably with
immutable tags and registry-level scanning enabled. Set `IMAGE_PREFIX` to:

```text
<account-id>.dkr.ecr.<region>.amazonaws.com/ecom
```

Authenticate Docker before every build/push session because the ECR login token
expires after 12 hours:

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
docker compose build
docker compose push
```

Use a unique immutable `IMAGE_TAG` for deployments instead of reusing `latest`.
