🎮 프로젝트명: PlayHub (가칭)

“20가지 미니 보드게임과 4인 마피아 단체게임을 즐길 수 있는 웹 기반 멀티 게임 허브”

🧩 1. 프로젝트 개요
🎯 목적

누구나 웹 브라우저로 접속해서 간단한 미니게임부터 단체 마피아 게임까지 즐길 수 있는 웹 아케이드 허브를 만든다.
설치 X, 디자인 부담 X, 접근성 100%.

💡 컨셉

React 기반의 가벼운 게임 허브

1인용 미니게임 + 4인 단체 마피아 게임 지원

Firebase로 점수/랭킹/세션 관리

광고 수익 모델: 카카오 애드핏 (Kakao AdFit)

⚙️ 2. 기술 스택
영역	기술
Frontend	Next.js (React), TypeScript, Tailwind CSS, Framer Motion
State Mgmt	Zustand or Redux Toolkit
Backend	Firebase (Auth, Firestore, Storage, Hosting, Realtime DB)
Realtime Game	Firebase Realtime Database + WebSocket Layer (optional)
Auth	Firebase Authentication (Google, GitHub, 익명)
Ads	Kakao AdFit Script SDK
Deploy	Vercel
Analytics	Firebase Analytics
🧱 3. 주요 기능
3.1 홈 화면

20개 미니게임 + 1개 단체게임 카드 표시

“인기순 / 최신순 / 즐겨찾기” 정렬

카카오 애드핏 배너 광고 노출 영역:

홈 하단

게임 종료 후 결과 화면

3.2 게임 실행

/game/:id 경로로 접근

공통 UI 컴포넌트:

상단바: 홈 / 다시하기 / 점수 저장

광고 배너 (게임 하단)

단일 플레이 or 멀티플레이 모드 지원

3.3 로그인

Firebase Auth로 로그인 (Google / GitHub / 익명)

사용자 데이터 구조:

users: {
  uid: string;
  displayName: string;
  avatar: string;
  favoriteGames: string[];
  highScores: Record<string, number>;
  createdAt: Timestamp;
}

3.4 점수 & 랭킹

각 게임별 최고점 기록

Firebase Firestore에 저장 및 실시간 랭킹 반영

전세계 랭킹 / 친구 랭킹 구분 가능

3.5 즐겨찾기

게임 카드 우측 상단 ⭐ 클릭 → Firebase에 저장

“즐겨찾기 탭”에서 한눈에 확인

3.6 배너 광고 (카카오 애드핏)

광고 위치:

홈 하단 (728x90)

게임 결과 화면 하단 (320x100 or Responsive)

로드 방식:

<ins class="kakao_ad_area"
    style="display:none;"
    data-ad-unit="DAN-xxxxxxx"
    data-ad-width="320"
    data-ad-height="100"></ins>
<script async type="text/javascript" src="//t1.daumcdn.net/kas/static/ba.min.js"></script>

🕹️ 4. 포함될 게임 목록
🎯 싱글 플레이 미니게임 (20종)
번호	게임명	설명
1	틱택토	3x3 퍼즐 게임
2	카드 뒤집기	메모리 매칭 게임
3	숫자 맞추기	랜덤 숫자 추측
4	주사위 합치기	2개 주사위 합 10 만들기
5	미로 탈출	랜덤 미로 자동 생성
6	색상 반응 테스트	반응 속도 측정
7	스네이크	고전 뱀 게임
8	2048	숫자 퍼즐
9	블록 피하기	미니 런 게임
10	가위바위보	랜덤 AI 대결
11	단어 퍼즐	랜덤 단어 찾기
12	클릭 챌린지	제한 시간 내 클릭 수
13	기억 순서 게임 (Simon)	색 순서 기억하기
14	미니 체스	4x4 체스
15	계산 퀴즈	속셈 게임
16	색 구별하기	다른 색 찾기
17	숫자 피라미드	수학 퍼즐
18	데일리 미션	하루 한 번 랜덤 게임
19	스피드 타이핑	타자 속도 테스트
20	행맨	영어 단어 추리
🧑‍🤝‍🧑 단체 게임 (4인 멀티)
항목	내용
게임명	마피아 (Mafia Game)
인원	4명 (자동 매칭 or 초대 링크)
진행 구조	호스트 생성 → 방 코드 공유 → 참가자 입장
역할	시민 3명, 마피아 1명 (랜덤 배정)
단계	

방 생성 / 입장

역할 배정 (마피아 DM 발송)

토론 타이머 (1분)

투표 및 결과 발표

라운드 반복 or 종료

| 기술 구조 |

Firebase Realtime Database로 방 상태 실시간 동기화

Firestore로 게임 로그 저장

WebSocket Layer (선택): 빠른 실시간 반응 보완

💾 5. 데이터 구조 (Firebase 예시)
// users
{
  uid: "maccrey01",
  displayName: "Maccrey",
  favoriteGames: ["snake", "mafia"],
  highScores: { "2048": 2048, "snake": 50 },
  createdAt: Timestamp
}

// games
{
  id: "mafia",
  title: "마피아 게임",
  type: "multiplayer",
  minPlayers: 4,
  maxPlayers: 4,
  description: "4인 실시간 마피아 게임"
}

// rooms (for mafia)
{
  roomId: "xyz123",
  hostId: "abc123",
  players: [
    { uid: "abc123", role: "citizen" },
    { uid: "def456", role: "mafia" },
    ...
  ],
  status: "voting", // waiting, playing, voting, ended
  round: 2
}

🪄 6. UX 플로우

홈 접속 → 게임 카드 클릭

싱글게임 → 즉시 실행

마피아게임 → 방 생성 or 참가

게임 진행 → 점수 저장 or 랭킹 반영

결과 화면 → 카카오 애드핏 광고 노출

홈으로 복귀

🔥 7. 개발 단계별 계획
단계	내용	기간
1단계	홈 UI + Firebase 연결 + AdFit 배너 세팅	1주
2단계	기본 미니게임 5종 구현	2주
3단계	점수 / 랭킹 시스템	1주
4단계	마피아 멀티플레이 구현	2~3주
5단계	나머지 15개 게임 추가	3~4주
6단계	QA + Vercel 배포	1주
💰 8. 수익 모델
항목	설명
광고 수익	카카오 애드핏 배너 광고
프리미엄 유저	광고 제거 + 전용 아바타 제공
데일리 미션 보상	일정 점수 이상 시 랜덤 아이템 제공
💡 9. 확장 아이디어

🔊 보이스 채팅 마피아 (WebRTC)

🧠 AI 시민/마피아 봇 모드

📱 PWA 지원 → 모바일에서도 앱처럼 실행

🪙 Firebase Functions로 데일리 보상 처리

🌎 다국어 지원 (한/영)