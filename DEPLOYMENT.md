# DEPLOYMENT.md — 배포·운영

## 웹
- `main` push → GitHub Pages (https://ordinarypeople1.github.io/onsen-tycoon/)

## Android
- 테스트 APK: `.github/workflows/android-apk.yml` (main push) → 아티팩트 `capybara-onsen-debug-apk`
- 출시 AAB: `.github/workflows/android-release.yml` (수동 실행, 입력 `version_name`) → 서명 `bundleRelease` → 아티팩트 `capybara-onsen-<ver>-<run>-aab`
  - Secrets: ANDROID_UPLOAD_KEYSTORE_B64, ANDROID_UPLOAD_STORE_PASSWORD, ANDROID_UPLOAD_KEY_ALIAS, ANDROID_UPLOAD_KEY_PASSWORD
  - versionCode = `github.run_number` (항상 증가)
- Play Console 업로드: 수동 (자동 업로드 없음)
- 로컬: `npm run sync` → `npx cap open android`

## iOS
- `.github/workflows/ios-release.yml` (수동) → TestFlight 업로드. Secrets: ASC_KEY_P8_B64, ASC_KEY_ID, ASC_ISSUER_ID, IOS_TEAM_ID
