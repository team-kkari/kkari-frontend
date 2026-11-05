# kkari-frontend

React + TypeScript + Vite + Zustand, [Feature-Sliced Design](https://feature-sliced.design/kr/) 구조

## 시작하기

```bash
npm install
cp .env.example .env
npm run dev
```

## 스크립트

| 명령어             | 설명                         |
| ------------------ | ---------------------------- |
| `npm run dev`      | 개발 서버                    |
| `npm run build`    | 타입 체크 + 빌드             |
| `npm run lint`     | oxlint                       |
| `npm run lint:fsd` | FSD 구조 규칙 검사 (steiger) |
| `npm run format`   | prettier 포맷팅              |

## 폴더 구조 (FSD)

```
src/
├── app/        # 앱 진입점, 라우터, 전역 스타일, 전역 Provider
├── pages/      # 라우트 단위 페이지
├── widgets/    # 여러 feature/entity를 조합한 큰 UI 블록 (헤더, 사이드바 등)
├── features/   # 사용자 행동 단위 기능 (로그인, 좋아요 등)
├── entities/   # 비즈니스 엔티티 (user, post 등) — 모델(zustand store), UI, API
└── shared/     # 도메인과 무관한 공용 코드 (ui, api, lib, config)
```

### 규칙

- **import 방향**: 위 레이어는 아래 레이어만 import 할 수 있음
  `app → pages → widgets → features → entities → shared`
- 같은 레이어의 다른 slice는 import 하지 않음 (예: `features/a` → `features/b` ❌)
- slice 외부에서는 **`index.ts`(public API)를 통해서만** import
  - ✅ `import { useCounterStore } from '@/entities/counter'`
  - ❌ `import { useCounterStore } from '@/entities/counter/model/store'`
- slice 내부 segment: `ui/`, `model/`(zustand store, 타입), `api/`, `lib/`, `config/`
- 절대 경로 alias: `@/` → `src/`

### Zustand store 예시

`src/entities/counter/model/store.ts` 참고. store는 해당 slice의 `model/` 안에 두고, `index.ts`에서 export 합니다.
