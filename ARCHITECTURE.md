# ARCHITECTURE.md — 카피바라 온천 타이쿤

> 근거: `package.json`, `capacitor.config.json`, `save.js`, `native.js`, `docs/BACKEND.md`, `.github/workflows/*`, `android/app/build.gradle`.

## 개요
료칸/온천 경영 타이쿤. 웹(GitHub Pages) + Android/iOS(Capacitor 래핑). 서버·계정 없음.

## 기술 스택
- 순수 JavaScript + Canvas, 번들러 없음. 진입 `index.html`, 주요 `game.js`, `water.js`, `fx.js`, `ambient.js`, `audio.js`, `photo.js`, `mobile.js`, `guest-motion.js`, `i18n.js`(ko/en/ja/zh-TW), `meta.js`, `shell.js`
- 네이티브: Capacitor 8 (`@capacitor/app, core, haptics, preferences, splash-screen, status-bar`), `native.js`
- 웹 산출물: `node tools/build_www.js` → `www/` → `npx cap sync`

## 저장
- `localStorage` 슬롯 3개 (`save.js` LocalAdapter). 앱에서는 Capacitor Preferences에 백업(`native.js`).
- 원격 저장 어댑터(Supabase/Firebase)는 코드만 준비, **비활성** (`docs/BACKEND.md`).
- 방문 링크 `#visit=<저장코드>` 읽기 전용.

## 수익화
- 광고·인앱결제 SDK: 코드에서 발견되지 않음(2026-10-30 점검). 게임 내 '결제'는 게임 화폐.

## 분석/크래시
- Firebase/Crashlytics/Analytics: 없음.

## 플랫폼 식별자
- appId `com.poiesis.capyonsen`, versionCode = CI `VERSION_CODE`(run_number), versionName = `VERSION_NAME`
- 개인정보처리방침: `privacy.html` → https://ordinarypeople1.github.io/onsen-tycoon/privacy.html
