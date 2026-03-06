# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # 개발 서버 실행 (port 3007, turbopack)
bun run build    # 프로덕션 빌드
bun run lint     # ESLint
bun run format   # Prettier
bun test         # Vitest (single run)
bun test:watch   # Vitest watch mode
```

단일 테스트 실행:
```bash
bun test src/shared/lib/time-utils.test.ts
```

## Architecture

FSD (Feature Sliced Design) 패턴을 따른다. 의존성 방향은 단방향:

```
app → widgets → features → entities → shared
```

같은 레이어 내 슬라이스 간 직접 참조 금지. 모든 import는 절대 경로(`@/`) 사용.

### 레이어별 역할

- **`src/app/`** - Next.js App Router 페이지. 라우팅만 담당.
- **`src/widgets/`** - 여러 feature/entity를 조합한 독립 UI 블록 (예: 게시글 목록)
- **`src/features/`** - 사용자 인터랙션 비즈니스 로직 (예: 좋아요, 글 작성)
- **`src/entities/`** - 비즈니스 엔티티 모델 및 기본 UI (예: ShampooRoom, User)
- **`src/shared/`** - 범용 유틸, hooks, UI 컴포넌트, API 클라이언트

### 슬라이스 내부 구조

각 레이어의 슬라이스는 다음 세그먼트로 구성:
- `ui/` - 컴포넌트
- `model/` - 상태 관리, custom hooks
- `api/` - 데이터 요청 함수
- `lib/` - 유틸리티
- `constants/` - 상수
- `index.ts` - public API (barrel export)

## API Client

`src/shared/api/client.ts`에 `ApiClient` 클래스 정의. `apiClient` 싱글턴 인스턴스 사용.
- 인증이 필요없는 요청: `apiClientWithoutAuth` 사용
- 응답 형식: `ApiResponse<T>` (단건), `ApiListResponse<T>` (목록, cursor 페이지네이션)
- 모든 요청에 `platform: SHAMPOO_ROOM_WEB` 헤더 자동 추가

## App Bridge

웹뷰 환경에서 네이티브 앱과 통신. `src/shared/lib/app-bridge.ts`:
- `openInAppWebView(path)` - 앱 내 페이지 이동
- `closeAppWebView()` - 웹뷰 닫기
- Android(`GoAppRouter.postMessage`) / iOS(`goAppRouter()`) 양쪽 지원

## UI Components

shadcn-ui 기반. `components.json`으로 설정. Tailwind CSS v4 사용.
- 범용 컴포넌트는 `shared/ui`에 위치
- 도메인 특화 컴포넌트는 해당 feature/entity의 `ui/`에 위치
