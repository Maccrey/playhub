# PlayHub

## Project Description
PlayHub is a mini-game collection platform built with Next.js, Firebase, and Tailwind CSS. It features user authentication, a variety of mini-games, a scoring and ranking system, and friend management capabilities.

## Features

### Phase 1: Project Setup & Core UI
- Next.js project initialized with TypeScript and Tailwind CSS.
- Firebase integrated for Auth, Firestore, and Realtime DB.
- Main layout (Header, Footer) and Home screen with game card grid.
- Kakao AdFit SDK integrated with ad banners.

### Phase 2: Authentication & User Profile
- Firebase Authentication (Google, GitHub, Anonymous login).
- Login page/modal and login/logout functionality.
- User profile page displaying user info.
- Firestore `users` data structure defined and creation logic implemented.

### Phase 3: First Mini-game (Tic-Tac-Toe) & Core Game Features
- Tic-Tac-Toe game logic and page layout.
- Common game UI components (Home/Restart/Save Score).
- Score saving to Firestore.

### Phase 4: Scoring & Ranking System
- High score recording in Firestore `users` data.
- Global ranking board UI and data display.
- Friend ranking system implemented.

### Phase 5: Favorites System
- "Favorite" button on `GameCard` components.
- Logic to add/remove games from `favoriteGames` array in Firestore.
- Home screen "Favorites" tab filtering.

### Phase 6: 4 Mini-games Added
- Card Flip
- Guess the Number
- Merge Dice
- Maze Escape

### Phase 7: Mafia Game - Lobby & Real-time Sync
- Mafia game lobby UI (create/join room).
- Firebase Realtime Database for room creation.
- Join room logic using room codes.
- Real-time player list synchronization in the lobby.
- Host-only "Start Game" functionality.

### Phase 8: Mafia Game - Core Gameplay
- Role assignment (Citizen, Mafia) and individual role notification.
- Discussion timer functionality.
- Voting functionality.
- Vote tallying and player elimination logic.
- Game end condition logic (all Mafia eliminated or Mafia count = Citizen count).
- Game logs recorded in Firestore.

### Phase 9: 15 More Mini-games Implemented
- **Batch 1**: Color Reaction, Snake, 2048, Block Dodger, Rock Paper Scissors
- **Batch 2**: Word Puzzle, Click Challenge, Simon Game, Mini Chess, Math Quiz
- **Batch 3**: Color Match, Number Pyramid, Daily Mission, Speed Typing, Hangman
- All games integrated with game page layout and home screen.

### Phase 10: QA, Deployment & Final Polishing
- Integrated testing for all games and features.
- Playwright E2E tests for major user flows (login, game play, score check).
- Vercel deployment.
- Firebase Hosting setup.
- Final QA of the deployed version.
- UX improvements with Framer Motion animations/transitions.
- "How to Play" instructions button and UI for each game.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd playhub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    - Create a Firebase project on the [Firebase Console](https://console.firebase.google.com/).
    - Enable Firebase Authentication (Google, GitHub, Anonymous).
    - Enable Firestore and Realtime Database.
    - Copy your Firebase project configuration and update `app/src/lib/firebase.ts` with your credentials.
    ```typescript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID",
      measurementId: "YOUR_MEASUREMENT_ID"
    };
    ```

## Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Playwright E2E tests are configured to run against the application. To run the tests:

1.  Ensure the application is running in development mode:
    ```bash
    npm run dev
    ```

2.  In a separate terminal, run the Playwright tests:
    ```bash
    npx playwright test
    ```

    To run tests in UI mode:
    ```bash
    npx playwright test --ui
    ```

    To run a specific test file:
    ```bash
    npx playwright test tests/e2e/auth.spec.ts
    ```

