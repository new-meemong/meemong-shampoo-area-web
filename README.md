# 미몽 샴푸실 웹

Flutter 앱에 임베드되어 미용업 종사자들의 샴푸실 게시글과 댓글, 지역 기반 탐색을 제공하는 Next.js 웹뷰입니다.

## 주요 기능

- 샴푸실 게시글 목록, 상세, 작성 및 수정
- 댓글과 답글
- 지역 선택과 필터링
- 동영상 광고 노출
- Flutter 앱 브리지 기반 화면 이동

## 기술 스택

- Next.js 15
- React 19
- TypeScript 5
- Tailwind CSS 4
- TanStack Query
- Zustand
- Firebase
- Vitest

## 실행 환경

- Node.js 22.x
- npm

## 시작하기

```bash
npm ci
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3007`에서 실행됩니다.

## 검증 및 빌드

```bash
npm run test -- --run
npm run lint
npm run build
```

프로덕션 빌드 실행:

```bash
npm run start
```

에이전트용 프로젝트 규칙은 [AGENTS.md](./AGENTS.md)를 참고합니다.
