# Tribore Platform

This repository hosts the Tribore B2B automotive parts platform. The backend lives on the `main` branch, while the production-ready frontend is maintained on the `frontend-1.3` branch. Use this README as the top-level map so teams can quickly find the right codebase and spin up local environments.

## Branch Layout
- `main` – Node.js/Express backend with Prisma ORM, AWS S3 uploads, PDF generation, Postgres schema, automated tests, and API documentation.
- `frontend-1.3` – Latest frontend implementation (UI, client routing, assets). Check that branch out when you need to work on the user-facing experience.

> Tip: keep the backend and frontend on separate local clones or Git worktrees to avoid switching branches in a single working tree.

### Checking out each surface
```bash
# backend
git checkout main

# frontend (first fetch once)
git fetch origin frontend-1.3
git checkout frontend-1.3
```

## Backend Overview (`main`)
- **Runtime:** Node.js 18–20 (ESM modules)
- **Framework:** Express 4.21 with Helmet, CORS, compression, and request logging (`morgan` + `winston`)
- **Database:** PostgreSQL via Prisma 5.14 (`prisma/schema.prisma`)
- **Auth & Roles:** JWT-based auth with Customer, Supplier, and Admin roles
- **Storage:** AWS S3 (via `multer-s3`) for order images and generated PDFs
- **Business Domains:** Customers, Suppliers, Orders, Quotes, Vahan integration, Notifications, PDF/markup services
- **Docs & Tooling:** `API_DOCUMENTATION.md` / `.pdf`, Postman collection `Tribore_Backend_API.postman_collection.json`, automated end-to-end tests under `test_flow/`

## Backend Quick Start
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Copy environment template**
   ```bash
   cp .env.example .env
   # then fill in database, JWT, AWS, and origin values
   ```
3. **Generate Prisma client (postinstall already runs this)**
   ```bash
   npx prisma generate
   ```
4. **Apply schema to your database**
   ```bash
   # for existing prod-like DBs
   npx prisma migrate deploy
   # or for local dev
   npx prisma migrate dev --name init
   ```
5. **Seed baseline data (optional)**
   ```bash
   npm run seed
   ```
   This seeds test accounts (phones `1111111111`, `0123456789`, `9999998888` with PIN/password `****`).
6. **Run the API**
   ```bash
   npm run dev   # nodemon
   # or
   npm start     # plain node for production parity
   ```
7. **Health check:** `GET http://localhost:8080/health`

## Environment Variables
See `.env.example` for the complete list. Key values:
- `PORT` – HTTP port (default `8080`)
- `DATABASE_URL` – Postgres connection string used by Prisma
- `JWT_SECRET` – 32+ char secret for token signing
- `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_REGION`, `AWS_BUCKET` – S3 uploads for order images and generated PDFs
- `ALLOWED_ORIGINS` – comma-separated list consumed by CORS middleware
- `QUOTE_WAIT_TIME_MINUTES` – controls supplier quote window (default `30`)
- `API_SETU_KEY`, `API_SETU_URL` – optional Vahan integration
- `LOG_LEVEL` – winston log level (`info` by default)

## Useful Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Express with nodemon & detailed logs |
| `npm start` | Production-style start (node `server.js`) |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run seed` | Seed sample admin/supplier/customer users |
| `npm run test:all` | Execute comprehensive API regression suite (`test_flow/test_all_endpoints.js`) |
| `npm run generate-pdf` | Rebuild `API_DOCUMENTATION.pdf` from Markdown via `md-to-pdf` |

### Automated Test Suite
The `test_flow` directory contains an end-to-end script covering auth, customers, suppliers, orders, quotes, notifications, and PDF flows. Ensure the server is running, then execute `npm run test:all`. Results and JSON reports are stored under `test_flow/test-report-*.json`.

## API Documentation
- Markdown: `API_DOCUMENTATION.md`
- PDF: `API_DOCUMENTATION.pdf` (regenerate via `npm run generate-pdf`)
- Postman: `Tribore_Backend_API.postman_collection.json`

Use these artifacts for endpoint reference, workflows, and deployment guidance. The documentation already captures rate limits, role permissions, and sample payloads.

## Logs & Observability
- Runtime logs: `logs/combined.log` & `logs/error.log` (managed by Winston transports)
- HTTP access logs: `morgan` switches to `combined` format automatically in production
- Graceful shutdown & signal handling live in `server.js`

## Frontend (`frontend-1.3`)
- Contains the UI that consumes the backend REST API.
- Workflow:
  1. `git checkout frontend-1.3`
  2. Follow the frontend-specific README/package scripts inside that branch.
  3. Point `.env` (or runtime config) at the backend base URL (`http://localhost:8080` during local dev).
- Keep backend and frontend branches aligned via shared environment values (`ALLOWED_ORIGINS`, API base URLs, auth token storage conventions).

## Deployment Notes
- Designed for AWS Elastic Beanstalk / Amazon Linux 2023 (Node 18–20)
- Prisma 5.14 provides built-in connection pooling—no extra adapters required
- Helmet, rate limiting, centralized error handler, and request logging are already enabled in `src/app.js`
- Use environment-specific `.env` values and secure AWS credentials via your platform’s secret manager

## Contributing
1. Create a feature branch off the relevant surface (`main` for backend, `frontend-1.3` for frontend).
2. Keep commits scoped (docs/tests included).
3. Run `npm run test:all` (backend) or the frontend test suite before opening PRs.
4. Reference `API_DOCUMENTATION.md` when adding or modifying endpoints to keep docs in sync.

## License
ISC License – see `package.json`.
