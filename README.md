# Tasky — Task Management App (Expo + React Native + TypeScript)

Production-quality task manager for gig workers. Email/password Firebase Auth,
per-user Firestore task storage (`users/{uid}/tasks/{taskId}`), Zustand state,
React Native Paper UI inspired by the supplied mockups (light theme, indigo
primary, rounded cards, priority chips, grouped dashboard).

## Prerequisites

- Node.js 20+ and npm
- Expo CLI via `npx expo` (no global install needed)
- Android Studio emulator or Expo Go on a physical device
- A Firebase project (free Spark plan is enough) with **Authentication →
  Email/Password enabled** and **Cloud Firestore** created

## Installation

```bash
cd Tasky
# The repo pins expo-router ~4.0.19 against expo ~53; plain `npm install`
# may hit an ERESOLVE peer conflict on expo-constants, so use:
npm install --legacy-peer-deps
cp .env.example .env   # then fill in your Firebase values (see below)
npx expo start
```

Press `a` (Android emulator), `i` (iOS simulator, macOS only), or scan the QR
code with Expo Go. Alternatively `npm run android` / `npm run ios`.

## Environment configuration

`.env` (git-ignored) uses Expo public vars:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

If any required var is missing, the app shows
“Missing EXPO_PUBLIC_… Copy .env.example to .env…” instead of crashing.
Never commit real values; only `.env.example` (placeholders) is tracked.

## Firebase setup (required from you)

1. **Create project** at https://console.firebase.google.com → Add project.
2. **Authentication → Sign-in method → Email/Password → Enable → Save.**
3. **Firestore Database → Create database** (production mode, choose a region).
4. **Project settings → Your apps → Web app (`</>`)** → copy the
   `firebaseConfig` values into your local `.env`.
5. **Deploy the security rules** in `firestore.rules`:
   Firestore → Rules tab → paste the file contents → Publish. Or with the
   Firebase CLI: `firebase deploy --only firestore:rules`.
6. (Optional, recommended) **Register the app scheme**: Authentication →
   Settings → Authorized domains already covers web; no extra step needed for
   Expo Go email/password auth.

## Firestore Security Rules

See `firestore.rules`. Summary:

- Default deny everything (`match /{document=**} → allow read, write: if false`).
- Only `request.auth.uid == uid` may read/write `users/{uid}/tasks/{taskId}`.
- On create/update, required keys (`title, priority, completed, dueDate,
  createdAt, updatedAt`), `title` 1–200 chars, `priority ∈ {low, medium, high}`,
  `completed` bool, date fields timestamps.
- Deletes need ownership only (no payload to validate).

## Architecture

Feature-based, screens never touch Firestore directly:

```
app/                  expo-router routes (presentation)
  index.tsx           onboarding ("Get things done." + Get started / Log in)
  login.tsx           "Welcome back!" + email/pass + visibility toggle
  register.tsx        "Let's get started!" + email/pass
  tasks/index.tsx     dashboard (header, search, counts, filters, sections, FAB)
  tasks/new.tsx       create flow (modal)
  tasks/[id].tsx      details + inline edit + delete confirm
src/
  components/         AppLogo, TaskCard (toggle + delete confirm), TaskForm
                      (RHForm + Zod + native date picker), FilterBar, States
  state/              authStore, taskStore (Zustand; no Firebase logic in screens)
  domain/task.ts      Task model, Zod schemas, Priority/Status filters,
                      filterAndSortTasks (client-side filter + deterministic
                      sort: dueDate → createdAt → id)
  data/               authRepository, taskRepository (all Firebase calls here;
                      real-time onSnapshot subscribe, serverTimestamp writes,
                      malformed docs skipped via toDateSafe)
  core/               firebase.ts (init + AsyncStorage persistence w/ fallback),
                      theme.ts (indigo palette), date.ts (sectionForDueDate:
                      Overdue/Today/Tomorrow/This week/Later), errors.ts
                      (friendly auth/firestore messages, codes kept for debug)
```

Key flows:

- **Auth**: `authStore.init()` subscribes `onAuthStateChanged` once in
  `_layout.tsx` Gate; session restores on restart via React Native persistence.
  `_layout` routes authenticated users to `/tasks`, others to `/login`.
  `signOut` and any account change call `taskStore.handleAccountChange`,
  which unsubscribes and clears user-specific tasks (no leakage, no duplicate
  listeners).
- **Tasks**: dashboard subscribes with the current UID; writes go through the
  repository with `saving` guards against double-taps; toggle is optimistic
  with snapshot rollback on error.
- **Dashboard**: counts from the full collection; priority + status filters
  combine client-side (no composite index needed); search filters title +
  description; sections derive from due dates with overdue handled explicitly.

No social login buttons are shown (mockups display them, but no provider is
configured — showing them would be fake functionality). No bottom-tab
decorations; every visible control works.

## Manual testing checklist

- [ ] Register a new account → lands on dashboard, welcome shows your email.
- [ ] Create a task (title, date, priority) → appears in the correct section.
- [ ] Edit it from details → updated values persist after reload.
- [ ] Toggle complete → counts update, styling changes; reopen works.
- [ ] Delete → confirmation dialog appears; confirm removes it.
- [ ] Combine priority + status filters → list/counts react; Clear resets.
- [ ] Search by title → narrows list; clearing restores it.
- [ ] Invalid forms (bad email, short password, empty title) show messages;
      submit stays disabled until valid.
- [ ] Wrong password / duplicate email show friendly errors.
- [ ] Logout → login screen; tasks cleared. Restart app → session restores
      (logged-in returns to dashboard; logged-out stays at auth).
- [ ] Second account cannot see the first account's tasks.
- [ ] Airplane mode → friendly network error + Retry.

## Stage status (implementation / developer / user are separate)

- **Stage 0 — Inspection & baseline.** Implementation: Implemented. Developer
  verification: Passed (`tsc --noEmit` clean after fixes; domain unit checks
  passed — see below). User verification: Not verified. Evidence: this repo
  state + `package.json` (Expo 53, router 4, paper 5, firebase 10, RHF+Zod;
  `zustand` was missing and added as `^5.0.15`). Blockers: none.
- **Stage 1 — Architecture & visual foundation.** Implementation: Implemented.
  Developer verification: Passed (typecheck clean; mockup-inspired indigo
  theme, AppLogo, cards, chips, dialogs in place). User verification: Not
  verified. Evidence: `src/core/theme.ts`, `src/components/*`, auth +
  dashboard screens. Blockers: none.
- **Stage 2 — Auth & session.** Implementation: Implemented. Developer
  verification: Partially verified (validation/error mapping reviewed; submit
  guards in place; **live Firebase auth not run here — no credentials in this
  environment**). User verification: Not verified. Evidence: code review +
  `friendlyAuthError` mapping; needs your test accounts. Blockers: needs your
  Firebase project + explicit confirmation.
- **Stage 3 — Data layer & security.** Implementation: Implemented. Developer
  verification: Partially verified (repository scoping reviewed, rules file
  present, malformed-timestamp handling + `toDateSafe` covered by code
  inspection; **rules not deployed and cross-account isolation not executed
  here**). User verification: Not verified. Evidence: `src/data/*`,
  `firestore.rules`. Blockers: you must configure Firebase, deploy rules,
  confirm account isolation.
- **Stage 4 — CRUD & dashboard.** Implementation: Implemented. Developer
  verification: Partially verified (sorting/filter/section logic executed and
  passing — see Commands; **live CRUD against Firestore not run here**). User
  verification: Not verified. Evidence: node checks below + code. Blockers:
  needs your on-device verification of create/edit/delete/toggle/filters.
- **Stage 5 — Errors, a11y, platform.** Implementation: Implemented.
  Developer verification: Partially verified (`tsc` clean; friendly error
  states, retry, touch targets, safe areas, keyboard avoidance, a11y labels
  in place; **`expo lint` could not run** — see Limitations; no emulator/iOS
  run here). User verification: Not verified. Blockers: run in your target
  environment and report issues.
- **Stage 6 — Docs & handoff.** Implementation: Implemented (this README +
  `.env.example` + `firestore.rules`). Developer verification: Passed.
  User verification: Not verified — final acceptance checkboxes below remain
  unchecked until you confirm.

**Your acceptance (do not check until you have done each):**

- [ ] I followed the setup instructions successfully.
- [ ] I launched the app successfully.
- [ ] I verified registration, login, logout, and session restoration.
- [ ] I verified task creation, viewing, editing, deletion, completion,
      filtering, and sorting.
- [ ] I confirmed task data persists after reopening the app.
- [ ] I confirmed account isolation or reviewed the testing limitation.
- [ ] I reviewed the README and remaining limitations.
- [ ] I accept the submission.

## Commands & checks actually completed

- `./node_modules/.bin/tsc --noEmit` → clean (exit 0). Fixed during this
  session: added missing `zustand` dep, fixed `_layout` segments typing,
  created missing `app/tasks/*` routes, set RHF `mode: "onChange"` so submit
  buttons enable correctly.
- Domain logic executed with node (`--experimental-strip-types`):
  sort order `a,c,b` PASS; combined priority+status filter PASS; all five
  date sections (Overdue/Today/Tomorrow/This week/Later) PASS.
- `expo lint` → **not run**: `expo lint` tries to install
  `eslint@^9`/`eslint-config-expo` and fails with an ERESOLVE peer conflict
  under this npm setup. `tsc` is the effective static check.
- No emulator/device run and no live Firebase integration test were executed
  in this environment (no credentials, no Android SDK/iOS here). Nothing is
  claimed as passed beyond what is stated above.

## Files created / modified in this session

- Created: `app/tasks/index.tsx` (dashboard), `app/tasks/new.tsx` (create),
  `app/tasks/[id].tsx` (details + edit), `README.md`.
- Modified: `app/_layout.tsx` (segments typing fix), `app/login.tsx`,
  `app/register.tsx`, `src/components/TaskForm.tsx` (validation mode fix),
  `package.json` + `package-lock.json` (added `zustand`, eslint dev deps via
  `expo lint` bootstrap attempt).
- Pre-existing, preserved as-is: `src/core/*`, `src/domain/*`, `src/data/*`,
  `src/state/*`, `src/components/{AppLogo,TaskCard,FilterBar,States}`,
  `app/index.tsx`, `firestore.rules`, `.env.example`, `app.json`,
  `tsconfig.json`, `babel.config.js`.

## Dependencies added / changed

- Added `zustand@^5.0.15` (was imported by the stores but missing from
  `package.json` — installs with `npm install --legacy-peer-deps`).
- `eslint@^9.0.0` + `eslint-config-expo@~9.2.0` added to devDependencies by
  the `expo lint` bootstrap (install did not complete; harmless for `expo
  start`, needed only if you run lint).

## Firebase setup still required from you

1. Create/enable the Firebase project pieces listed above and fill local `.env`.
2. Deploy `firestore.rules` and confirm the app talks to your project.
3. Verify auth, CRUD, filters, persistence, and account isolation on a device,
   then check the acceptance boxes.

## Known limitations / unverified behavior

- Live Firebase (auth, Firestore, rules deployment, two-account isolation),
  emulator/device, and iOS-specific checks were **not run here** — they need
  your project and devices.
- `expo lint` unavailable in this environment (peer-conflict on auto-install).
- Offline persistence is not claimed: the JS SDK persists the auth session
  via AsyncStorage, but Firestore offline cache behavior under Expo is not
  asserted.
- Dashboard header uses `#8B8BE8` for the rounded header band to echo the
  mockup; surfaces/cards remain white on the neutral background per spec.

## Definition of done

A user can register, log in, create/manage/filter/sort/complete/reopen tasks,
log out, and return later to find their own Firestore-persisted tasks —
**pending your Firebase configuration and the verifications above.** Nothing
in this report marks user verification complete; those boxes are yours to check.
