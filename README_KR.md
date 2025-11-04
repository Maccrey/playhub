# PlayHub

## 개요
PlayHub는 여러 캐주얼 미니 게임을 하나의 Next.js 애플리케이션에서 즐길 수 있도록 만든 웹 기반 플랫폼입니다. 빠르게 접근 가능한 게임 허브이자 간단한 소셜 기능과 기록 추적을 제공하며, Firebase가 인증과 저장소, 마피아 실시간 게임을 지원합니다.

### 기술 스택
- Next.js 14 (App Router, 정적 Export 지원)
- React 18 & TypeScript
- Tailwind CSS 4
- Firebase Authentication, Firestore, Realtime Database, Analytics
- Zustand 상태 관리
- next-intl 국제화

## 현재 구현된 기능
- **인증 & 프로필**
  - Firebase Auth를 통한 Google, GitHub, 익명 로그인
  - 사용자 문서를 Firestore에 자동 생성 (프로필, 즐겨찾기, 통계, 친구 요청)
  - 개인 정보, 즐겨찾기, 기록을 보여주는 프로필 페이지

- **홈 화면**
  - 다국어 게임 카드 그리드 (영어, 한국어, 일본어, 중국어)
  - Firestore와 동기화되는 즐겨찾기 토글
  - Kakao AdFit 배너 연동

- **미니 게임 라이브러리**
  - Tic-Tac-Toe, Snake, 2048, Daily Mission 등 21개 게임 제공
  - 점수 저장, 상태 유지, 종료 액션을 위한 공통 스캐폴딩
  - 최고 점수, 플레이 횟수, 마지막 플레이 시간 등 사용자별 통계 저장

- **랭킹 & 소셜**
  - 친구 관리, 점수 리더보드, 통합 통계
  - 일일 미션과 업적 데이터 구조

- **마피아 멀티플레이**
  - 방 생성/참가, 단축 코드 기반 로비
  - Firebase Realtime Database로 플레이어 목록 동기화 및 역할 배정
  - 토론/투표 타이머, 탈락 처리, 승리 판정, 로그 기록

- **국제화**
  - 로케일 기반 라우팅(`/[locale]/…`) 및 공유 네비게이션 훅
  - 영어/한국어/일본어/중국어 메시지 카탈로그

- **도구 체인**
  - ESLint, TypeScript strict mode, Playwright E2E 테스트
  - GitHub Pages 정적 배포 워크플로우

## 시작하기

### 1. 프로젝트 복제 & 설치
```bash
git clone <repository-url>
cd playhub
npm install              # 워크스페이스 루트 의존성
cd app
npm install              # Next.js 앱 의존성
```

### 2. Firebase 설정
Firebase 콘솔에서 프로젝트를 생성하고 다음을 활성화합니다.
- Authentication (Google, GitHub, Anonymous)
- Firestore
- Realtime Database

환경 변수를 `app/.env.local`에 추가하세요.
```bash
NEXT_PUBLIC_API_KEY=...
NEXT_PUBLIC_AUTH_DOMAIN=...
NEXT_PUBLIC_PROJECT_ID=...
NEXT_PUBLIC_STORAGE_BUCKET=...
NEXT_PUBLIC_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_APP_ID=...
NEXT_PUBLIC_MEASUREMENT_ID=...
```

런타임은 `app/src/lib/firebase.ts`에서 이 값을 사용합니다.

### 3. 로컬 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인합니다.

## 테스트
Playwright로 핵심 기능 E2E 테스트를 수행할 수 있습니다.
1. 서버를 실행합니다.
   ```bash
   npm run dev
   ```
2. 별도의 터미널에서 테스트를 실행합니다.
   ```bash
   npx playwright test
   ```
   ```bash
   npx playwright test --ui
   npx playwright test tests/e2e/auth.spec.ts
   ```

## 배포 (GitHub Pages)
`main` 브랜치에 푸시하면 `.github/workflows/deploy-pages.yml`이 정적 사이트를 빌드해 GitHub Pages에 배포합니다.

### 필요한 GitHub 시크릿
`Settings > Secrets and variables > Actions`에 다음을 추가합니다.
- NEXT_PUBLIC_API_KEY
- NEXT_PUBLIC_AUTH_DOMAIN
- NEXT_PUBLIC_PROJECT_ID
- NEXT_PUBLIC_STORAGE_BUCKET
- NEXT_PUBLIC_MESSAGING_SENDER_ID
- NEXT_PUBLIC_APP_ID
- NEXT_PUBLIC_MEASUREMENT_ID

### GitHub Pages 초기 설정
1. `Settings > Pages`에서 Source를 **GitHub Actions**로 설정합니다.
2. 기본 브랜치가 `main`인지 확인합니다.

### 배포 동작
1. `main`에 푸시하면 워크플로우가 `npm run build:pages`를 실행해 `app/out`을 생성합니다.
2. `actions/deploy-pages`가 결과물을 GitHub Pages에 게시합니다.
   - 사용자/조직 페이지(`<USERNAME>.github.io`)는 루트에 배포됩니다.
   - 프로젝트 페이지는 `https://<USERNAME>.github.io/<REPOSITORY>/` 경로에서 접근합니다.

### 로컬 정적 프리뷰
```bash
cd app
npm run build
npx serve out
```
출력된 URL에서 정적 Export 결과를 확인할 수 있습니다.

## 추가 개발 노트
- ESLint가 일부 미해결 경고/오류를 보고합니다. 배포 전 `npm run lint` 결과를 검토하세요.
- Firebase 시크릿 값은 반드시 GitHub 시크릿으로 관리해 노출을 방지하세요.
