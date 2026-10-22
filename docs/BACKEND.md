# 저장 백엔드 가이드

이 게임은 **계정·서버 없이** 동작합니다. 기본 저장은 브라우저 `localStorage`이고, 원격 저장은 아래 어댑터에 설정만 넣으면 켜지도록 준비만 되어 있어요. (이 저장소는 어떤 외부 계정도 만들지 않았습니다.)

## 구조 (`save.js`)
| 구성 | 설명 |
|---|---|
| `SAVE.adapter` | 현재 어댑터. 기본 `LocalAdapter` |
| 어댑터 인터페이스 | `load(slot)`, `save(slot,obj)`, `list()`, `remove(slot)` — 모두 Promise |
| `SAVE.mirror(S)` | 로컬 저장 직후 호출. 원격 어댑터면 30초 디바운스로 업로드 |
| `SaveCodec` | `YUZU1.z.<base64url(deflate-raw(JSON))>` 저장 코드 (CompressionStream 미지원 시 `YUZU1.j.`) |
| 방문 링크 | `index.html#visit=<저장 코드>` → 읽기 전용(저장·건설·철거·이동 차단). 해시는 서버로 전송되지 않음 |

슬롯 키: 슬롯1 `onsen2`, 슬롯2·3 `onsen2_s2`·`onsen2_s3`. 설정 `onsenSet`, 현재 슬롯 `onsenSlot`.

## Supabase로 켜기
1. 프로젝트 생성 → Authentication에서 익명 로그인(또는 이메일) 활성화
2. SQL:
```sql
create table saves (user_id uuid default auth.uid() references auth.users, slot int, data jsonb, updated_at timestamptz default now(), primary key(user_id,slot));
alter table saves enable row level security;
create policy "own saves" on saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
3. `index.html`에서 `supabase-js`로 로그인 후:
```js
SAVE.use(new SAVE.SupabaseAdapter({url:'https://<proj>.supabase.co', anonKey:'<anon key>', getToken:async()=> (await sb.auth.getSession()).data.session.access_token}));
```
anon key는 공개용 키라 클라이언트에 두어도 되며, 보안은 RLS가 담당합니다.

## Firebase로 켜기
1. 프로젝트 생성 → Authentication(익명) + Firestore 활성화
2. 보안 규칙:
```
match /users/{uid}/saves/{slot} { allow read, write: if request.auth != null && request.auth.uid == uid; }
```
3. Firebase Auth 로그인 후:
```js
SAVE.use(new SAVE.FirebaseAdapter({projectId:'<id>', getUid:async()=>auth.currentUser.uid, getToken:async()=>auth.currentUser.getIdToken()}));
```

## 공개 "방문" 갤러리로 확장하려면
- `shares(id text primary key, code text, created_at)` 테이블에 저장 코드를 넣고 `#visit=` 대신 `#v=<id>`로 조회 — 긴 링크를 짧게, 신고/삭제 관리 가능.
- 사진 장식(`S.pics`)은 작은 PNG data URL이라 그대로 포함됩니다. 공개 갤러리에서는 업로드 사진 검수 정책이 필요해요.
