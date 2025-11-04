# PlayHub

## Overview
PlayHub is a web-based playground that bundles casual mini-games under a single Next.js application. The project focuses on fast access to games, lightweight social features, and simple progression tracking. Firebase backs authentication, storage, and the real-time Mafia game experience.

### Tech Stack
- Next.js 14 (App Router, static export ready)
- React 18 with TypeScript
- Tailwind CSS 4
- Firebase Authentication, Firestore, Realtime Database, Analytics
- Zustand for client state
- next-intl for internationalization

## Current Implementation
- **Authentication & Profiles**
  - Google, GitHub, and anonymous login flows through Firebase Auth
  - User documents automatically provisioned in Firestore with profile fields, favorites, stats, and friend requests
  - Profile page showing personal data, favorite games, and performance history

- **Home Experience**
  - Responsive game grid with internationalized titles (English, Korean, Japanese, Chinese)
  - Favorites toggle synced with Firestore
  - Kakao AdFit banner integration

- **Mini-Game Library**
  - 21 playable games including classics (Tic-Tac-Toe, Snake, 2048) and originals (Daily Mission, Merge Dice)
  - Shared scaffolding for scoring, state persistence, and end-of-game actions
  - Stats saved per user: high scores, games played, last played timestamp

- **Ranking & Social Features**
  - Friend management, score leaderboards, and aggregated stats via Firestore
  - Daily missions and achievements tracked through per-game schemas

- **Mafia Multiplayer Mode**
  - Lobby with create/join room flow using short codes
  - Realtime player sync and role assignments via Firebase Realtime Database
  - Discussion and voting timers, elimination flow, end-game detection, and game logs

- **Localization**
  - Locale-aware routing (`/[locale]/…`) with shared navigation helpers
  - Message catalogs for English, Korean, Japanese, and Chinese

- **Tooling**
  - ESLint, TypeScript strict mode, and Playwright E2E tests
  - GitHub Pages static export workflow (see below)

## Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd playhub
npm install              # install workspace-level deps (Framer Motion, etc.)
cd app
npm install              # install Next.js app dependencies
```

### 2. Configure Firebase
Create a Firebase project and enable:
- Authentication (Google, GitHub, Anonymous)
- Firestore
- Realtime Database

Add the configuration to the `app/.env.local` file (create it if necessary):
```bash
NEXT_PUBLIC_API_KEY=...
NEXT_PUBLIC_AUTH_DOMAIN=...
NEXT_PUBLIC_PROJECT_ID=...
NEXT_PUBLIC_STORAGE_BUCKET=...
NEXT_PUBLIC_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_APP_ID=...
NEXT_PUBLIC_MEASUREMENT_ID=...
```

The runtime imports these values in `app/src/lib/firebase.ts`.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the app.

## Testing
Playwright is configured for E2E coverage of core flows.

1. Start the dev server if it is not already running:
   ```bash
   npm run dev
   ```
2. In a separate terminal, execute the tests:
   ```bash
   npx playwright test
   ```
   Optional flags:
   ```bash
   npx playwright test --ui         # interactive mode
   npx playwright test tests/e2e/auth.spec.ts
   ```

## Deployment (GitHub Pages)
The repository ships with `.github/workflows/deploy-pages.yml`, which builds and deploys the static export whenever `main` is updated.

### Required GitHub Secrets
Add these under `Settings > Secrets and variables > Actions`:
- `NEXT_PUBLIC_API_KEY`
- `NEXT_PUBLIC_AUTH_DOMAIN`
- `NEXT_PUBLIC_PROJECT_ID`
- `NEXT_PUBLIC_STORAGE_BUCKET`
- `NEXT_PUBLIC_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_APP_ID`
- `NEXT_PUBLIC_MEASUREMENT_ID`

### One-Time GitHub Setup
1. In `Settings > Pages`, set **Source** to `GitHub Actions`.
2. Ensure the default branch is `main`.

### Automated Flow
1. Push to `main` (or trigger the workflow manually).
2. GitHub Actions runs `npm run build:pages` inside `app`, creating `app/out`.
3. The resulting static bundle is published via `actions/deploy-pages`.

> For user/organization sites (`<USERNAME>.github.io`), the app is served from the root. Project sites use `https://<USERNAME>.github.io/<REPOSITORY>/`.

### Local Static Preview
To verify locally before pushing:
```bash
cd app
npm run build
npx serve out          # or any static file server
```
Visit the printed URL to confirm the static export works.
