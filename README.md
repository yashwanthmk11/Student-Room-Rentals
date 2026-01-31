# Campus Rooms / Student Room Rentals

Full‑stack app for listing, searching, and saving student room rentals. Frontend is a Vite + React + TypeScript SPA; backend is Node.js/Express with MongoDB.

## Stack
- Frontend: React 19, React Router, Axios, Vite
- Backend: Node.js, Express
- Database: MongoDB (Atlas or self-hosted)
- Infra helpers: `deploy-s3.ps1` / `deploy-s3.sh` for S3 static hosting

## Project Structure
- `client/` – Vite React app (SPA)
- `server/` – Express API (routes for auth, listings, matching, owner dashboard)
- `DEPLOYMENT.md` – detailed AWS deployment steps (S3/CloudFront + backend options)

## Prerequisites
- Node.js 18+ and npm
- MongoDB connection string
- AWS CLI (if deploying to S3/CloudFront)

## Frontend setup (client)
```bash
cd client
npm install
cp .env.example .env            # create your env file (see below)
npm run dev                     # local dev
npm run build                   # production build outputs to dist/
```

### Frontend env
Create `client/.env` (or `.env.local`, `.env.production`):
```
VITE_API_URL=http://localhost:4000
```

## Backend setup (server)
```bash
cd server
npm install
npm run start                   # or nodemon if you prefer
```

### Backend env
Create `server/.env`:
```
PORT=4000
MONGO_URI=mongodb+srv://...
JWT_SECRET=change_me
```

## Deploy
- Frontend: build then sync `client/dist/` to S3 (`deploy-s3.ps1` or `deploy-s3.sh`), or follow `DEPLOYMENT.md` for CloudFront + bucket policy.
- Backend: deploy to Elastic Beanstalk/EC2/etc. (see `DEPLOYMENT.md`).

Quick S3 sync (after `npm run build` in `client`):
```bash
aws s3 sync client/dist/ s3://YOUR_BUCKET --delete
```

## Scripts
- `client`: `npm run dev`, `npm run build`, `npm run preview`
- `server`: `npm run start`

## Notes
- SPA routing: ensure S3/CloudFront serves `index.html` for unknown routes.
- Keep secrets in env files; `.gitignore` already excludes common env patterns...





































