# DECISIONS.md — 결정 기록
형식: `## YYYY-MM-DD 제목` / 결정 / 이유. 뒤집을 땐 새 항목 추가. 과거 결정은 커밋·CHANGELOG에서 역추적한 것이며 날짜는 커밋 기준.

## 2026-10 계정·서버 없이 로컬 저장 (docs/BACKEND.md)
- 원격 저장은 어댑터만 준비. 이유: 운영비·관리 부담 최소화. 단점: 앱 삭제/기기 변경 시 진행 손실.

## 2026-10 Capacitor로 웹 코드를 그대로 Android/iOS 래핑
- 하나의 코드베이스로 웹·앱 동시 운영.

## 2026-10-24~26 다국어(ko/en/ja/zh-TW), 앱명 '카피바라 온천 타이쿤' (CHANGELOG v4.23~4.24)

## 2026-10-30 AI 에이전트 공통 문서 체계 도입
- AGENTS/ARCHITECTURE/DECISIONS/STATUS/DEPLOYMENT/WORKLOG + Issue/PR 템플릿.

## (제안, 승인 필요) 클라우드 세이브
- 수익화(IAP) 도입 전 Google Play 게임즈 저장 또는 BACKEND.md 어댑터 활성화 검토.
