# AGENTS.md — AI 에이전트 작업 규칙 (카피바라 온천 타이쿤)

여러 AI(ChatGPT, Claude, Grok, Codex, OpenRouter 모델 등)와 사람이 번갈아 작업합니다. 채팅 기록은 이어지지 않으므로 **이 저장소의 문서가 공통 기억**입니다.
⚠️ 이 저장소는 **공개(Public)** 입니다. 모든 커밋은 누구나 볼 수 있습니다.

## 세션 시작 시 (필수)
1. `STATUS.md` → 현재 상태, 남은 일
2. `WORKLOG.md` 최근 항목 → 직전 작업자 인수인계
3. `DECISIONS.md` → 이미 결정된 사항
4. 필요 시 `ARCHITECTURE.md`, `DEPLOYMENT.md`, `CHANGELOG.md`, `docs/BACKEND.md`
5. 열린 Issue/PR 확인. 작업은 Issue 하나에 대응시킨다.

## 세션 종료 시 (필수)
- `WORKLOG.md` 맨 위에 항목 추가: 한 일, 바꾼 파일, 검증, 다음 할 일, **사용 모델, API 비용 추정, PR/CI 통과 여부, 수정 라운드 수**.
- `STATUS.md` 갱신. 사용자에게 보이는 변경은 `CHANGELOG.md`. 새 방침은 `DECISIONS.md`.

## 브랜치와 PR
- `main` 직접 push 금지 (`main` push 시 Pages 배포·APK 빌드가 바로 돈다). 에이전트·작업마다 별도 브랜치: `feat/…`, `fix/…`, `chore/…`, `codex/…`.
- 여러 AI가 같은 브랜치를 공유하지 않는다. `game.js`는 큰 단일 파일이라 동시 수정 시 충돌이 잦다 — 한 번에 한 작업만.
- 병합은 사람이 한다.

## 사람 승인 없이 바꾸지 않는 것
- 결제·광고(현재 없음, 도입 자체가 승인 대상), 계정·로그인, 원격 저장(`docs/BACKEND.md` 어댑터 활성화)
- 저장 포맷·키(`onsen2`, `onsen2_s2/_s3`, `onsenSet`, `onsenSlot`, `YUZU1` 코덱) — 기존 유저 세이브 호환성
- 앱 ID `com.poiesis.capyonsen`, 서명 키, GitHub Secrets(ANDROID_UPLOAD_*, ASC_*, IOS_TEAM_ID), 출시 워크플로
- 경제 수치(가격·보상·승급 조건), 개인정보처리방침(`privacy.html`)
- 병합, 강제 push, 이력 재작성, 스토어 제출

## 시크릿 (공개 저장소!)
- 키스토어·비밀번호·API 키·개인정보·테스터 이메일을 절대 커밋하지 않는다. Secrets에만.
- 공개 키(예: Supabase anon key)도 넣기 전 DECISIONS.md에 기록.

## 정직한 보고
- 하지 않은 검증을 했다고 쓰지 않는다. 헤드리스 스크립트(tools/*)는 실기기 성능·재미의 증거가 아니다.

## 외부 모델
- 회사 업무 코드·자료는 이 저장소에 두지 않는다.

## 비용 기록 (실험당 총비용 최적화)
PR 본문과 WORKLOG에: 사용 모델 / API·구독 비용 추정 / 소요 시간 / CI·PR 통과 여부 / 수정 라운드 수.
