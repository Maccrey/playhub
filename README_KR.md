# PlayHub

## 프로젝트 설명
PlayHub는 Next.js, Firebase, Tailwind CSS로 구축된 미니 게임 컬렉션 플랫폼입니다. 사용자 인증, 다양한 미니 게임, 점수 및 랭킹 시스템, 친구 관리 기능을 제공합니다.

## 기능

### Phase 1: 프로젝트 설정 및 핵심 UI
- TypeScript 및 Tailwind CSS로 Next.js 프로젝트 초기화.
- 인증, Firestore, Realtime DB를 위한 Firebase 통합.
- 메인 레이아웃 (헤더, 푸터) 및 게임 카드 그리드가 있는 홈 화면.
- Kakao AdFit SDK 및 광고 배너 통합.

### Phase 2: 인증 및 사용자 프로필
- Firebase 인증 (Google, GitHub, 익명 로그인).
- 로그인 페이지/모달 및 로그인/로그아웃 기능.
- 사용자 정보가 표시되는 사용자 프로필 페이지.
- Firestore `users` 데이터 구조 정의 및 생성 로직 구현.

### Phase 3: 첫 번째 미니 게임 (틱택토) 및 핵심 게임 기능
- 틱택토 게임 로직 및 페이지 레이아웃.
- 공용 게임 UI 컴포넌트 (홈/다시 시작/점수 저장).
- Firestore에 점수 저장.

### Phase 4: 점수 및 랭킹 시스템
- Firestore `users` 데이터에 최고 점수 기록.
- 글로벌 랭킹 보드 UI 및 데이터 표시.
- 친구 랭킹 시스템 구현.

### Phase 5: 즐겨찾기 시스템
- `GameCard` 컴포넌트에 "즐겨찾기" 버튼(⭐).
- Firestore `favoriteGames` 배열에 게임 추가/제거 로직.
- 홈 화면 "즐겨찾기" 탭 필터링.

### Phase 6: 4가지 미니 게임 추가
- 카드 뒤집기
- 숫자 맞추기
- 주사위 합치기
- 미로 탈출

### Phase 7: 마피아 게임 - 로비 및 실시간 동기화
- 마피아 게임 로비 UI (방 생성/참가).
- Firebase Realtime Database를 이용한 방 생성.
- 방 코드를 이용한 방 참가 로직.
- 로비 내 플레이어 목록 실시간 동기화.
- 호스트 전용 "게임 시작" 기능.

### Phase 8: 마피아 게임 - 핵심 게임플레이
- 역할 배정 (시민, 마피아) 및 개인별 역할 통지 기능.
- 토론 타이머 기능.
- 투표 기능.
- 투표 결과 집계 및 플레이어 탈락 로직.
- 게임 종료 조건 로직 (마피아 전원 탈락 또는 마피아 수 = 시민 수).
- Firestore에 게임 로그 기록.

### Phase 9: 15가지 미니 게임 구현
- **Batch 1**: 색상 반응 테스트, 스네이크, 2048, 블록 피하기, 가위바위보
- **Batch 2**: 단어 퍼즐, 클릭 챌린지, 기억 순서 게임(Simon), 미니 체스, 계산 퀴즈
- **Batch 3**: 색 구별하기, 숫자 피라미드, 데일리 미션, 스피드 타이핑, 행맨
- 모든 게임이 게임 페이지 레이아웃 및 홈 화면과 통합.

### Phase 10: QA, 배포 및 최종 폴리싱
- 모든 게임 및 기능에 대한 통합 테스트.
- 주요 사용자 흐름 (로그인, 게임 플레이, 점수 확인)에 대한 Playwright E2E 테스트 작성.
- Vercel 배포.
- Firebase Hosting 설정.
- 배포 버전 최종 QA.
- Framer Motion 애니메이션/트랜지션 추가로 UX 개선.
- 각 게임에 게임 방법 설명서 버튼 및 UI 구현.

## 설치 지침

1.  **저장소 복제:**
    ```bash
    git clone <repository-url>
    cd playhub
    ```

2.  **의존성 설치:**
    ```bash
    npm install
    ```

3.  **Firebase 설정:**
    - [Firebase Console](https://console.firebase.google.com/)에서 Firebase 프로젝트를 생성합니다.
    - Firebase 인증 (Google, GitHub, 익명)을 활성화합니다.
    - Firestore 및 Realtime Database를 활성화합니다.
    - Firebase 프로젝트 구성을 복사하여 `app/src/lib/firebase.ts`에 자격 증명을 업데이트합니다.
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

## 애플리케이션 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 테스트

Playwright E2E 테스트는 애플리케이션에 대해 실행되도록 구성되어 있습니다. 테스트를 실행하려면:

1.  애플리케이션이 개발 모드에서 실행 중인지 확인합니다:
    ```bash
    npm run dev
    ```

2.  별도의 터미널에서 Playwright 테스트를 실행합니다:
    ```bash
    npx playwright test
    ```

    UI 모드에서 테스트를 실행하려면:
    ```bash
    npx playwright test --ui
    ```

    특정 테스트 파일을 실행하려면:
    ```bash
    npx playwright test tests/e2e/auth.spec.ts
    ```

## GitHub Pages 배포

이 프로젝트는 `main` 브랜치에 푸시될 때 GitHub Actions를 통해 GitHub Pages에 자동으로 배포되도록 설정되어 있습니다.

### 설정 방법

1.  **GitHub 저장소 시크릿 설정:**
    배포 시 Firebase 구성을 안전하게 사용하기 위해 GitHub 저장소에 시크릿을 설정해야 합니다. 다음 시크릿들을 `Settings > Secrets and variables > Actions` 에서 추가해주세요.

    *   `NEXT_PUBLIC_API_KEY`
    *   `NEXT_PUBLIC_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_PROJECT_ID`
    *   `NEXT_PUBLIC_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_APP_ID`
    *   `NEXT_PUBLIC_MEASUREMENT_ID`

    각 시크릿의 값은 Firebase 프로젝트의 웹 앱 구성에서 찾을 수 있습니다.

2.  **배포 확인:**
    `main` 브랜치에 변경 사항을 푸시하면, GitHub Actions 워크플로우가 자동으로 실행되어 프로젝트를 빌드하고 `gh-pages` 브랜치에 배포합니다. 배포 상태는 저장소의 `Actions` 탭에서 확인할 수 있습니다.

    배포가 완료되면 `https://<YOUR_GITHUB_USERNAME>.github.io/playhub/` 에서 애플리케이션을 확인할 수 있습니다.
