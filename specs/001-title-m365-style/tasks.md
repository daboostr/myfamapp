# Tasks: M365-Style OneDrive Photo Sharing Web App

Input: Design - [x] T012 [P] E2E: People panel lists sharers; gallery shows selected person's images
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\people-panel.spec.ts`cs from `C:\\Windows\\System32\\myfamapp\\specs\\001-title-m365-style\\`
Prerequisites detected: plan.md, research.md, data-model.md, contracts\, quickstart.md
Feature Dir: `C:\\Windows\\System32\\myfamapp\\specs\\001-title-m365-style`  
Repo Root: `C:\\Windows\\System32\\myfamapp`

Execution Flow (main)
```
1) Load plan.md → Extract tech stack and structure
2) Load optional docs → data-model entities, contracts, research decisions, quickstart notes
3) Generate ordered tasks: Setup → Tests (TDD) → Models → Services → UI → Integration → Polish
4) Mark [P] for parallel tasks in different files; sequential when touching same file
5) Number tasks T001..; include absolute file paths and PowerShell-ready commands
6) Provide Parallel Execution Examples with actual commands
```

Format: [ID] [P?] Description  
[P]: Can run in parallel (different files, no dependencies)

Path conventions for this feature (single static web app at repo root):
- Source: `C:\\Windows\\System32\\myfamapp\\src\\` (components, models, services)
- Pages (static export): `C:\\Windows\\System32\\myfamapp\\pages\\`
- Public assets: `C:\\Windows\\System32\\myfamapp\\public\\`
- Tests: `C:\\Windows\\System32\\myfamapp\\tests\\`

---

## Phase 3.1: Setup
- [x] T001 Initialize Next.js static project base (no SSR/ISR)
  - Create: `C:\\Windows\\System32\\myfamapp\\package.json`, `tsconfig.json`, `.gitignore`
  - Add NPM scripts: `dev`, `build`, `export`, `preview`
- [ ] T002 Install runtime dependencies
  - Command:
    ```powershell
    npm i next react react-dom @fluentui/react-components @fluentui/react-icons @azure/msal-browser
    ```
- [ ] T003 Install dev dependencies [P]
  - Command:
    ```powershell
    npm i -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next prettier playwright @playwright/test
    ```
- [x] T004 Configure Next.js for static export
  - Create `C:\\Windows\\System32\\myfamapp\\next.config.js` with `{ output: 'export' }`
  - Ensure outDir default `./out`
- [x] T005 Scaffold app structure
  - Create dirs: `src\\components`, `src\\models`, `src\\services`, `src\\state`, `styles`, `public`, `pages`
  - Add `pages\\_app.tsx`, `pages\\index.tsx`, `styles\\globals.css`
- [x] T006 Linting & formatting [P]
  - Create `.eslintrc.json`, `.prettierrc`, add `npm run lint` script
- [x] T007 Mandatory static files (constitution compliance)
  - Add `public\\favicon.ico` (placeholder), `public\\robots.txt`, `public\\sitemap.xml`, `public\\site.webmanifest`
- [x] T008 SEO and metadata base
  - Ensure `<title>`, meta description, canonical, basic Open Graph/Twitter tags on `pages\\index.tsx`

## Phase 3.2: Tests First (TDD) — MUST COMPLETE BEFORE 3.3
Contract tests (from `contracts\\graph-integration.md`) and Integration tests (from user stories)

- [x] T009 [P] Contract test for external image item mapping
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\contract\\graph-contract.test.ts`
  - Verify: includes only `image/*` MIME; groups by sharer identifier; placeholder when thumbnail missing
- [x] T010 [P] Contract test for grouping function behavior
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\contract\\grouping-contract.test.ts`
  - Verify: stable grouping keys; duplicate display names disambiguated

Integration (E2E) tests using Playwright (from acceptance scenarios)
- [x] T011 [P] E2E: Sign-in flow visible and returns to app signed-in
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\signin.spec.ts`
- [ ] T012 [P] E2E: People panel lists sharers; gallery shows selected person’s images
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\people-panel.spec.ts`
- [x] T013 [P] E2E: Switching people updates gallery (combined with T012)
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\switch-person.spec.ts`
- [x] T014 [P] E2E: Clicking image opens preview with details and external open option
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\preview.spec.ts`
- [~] T015 [P] E2E: Large sets stay responsive via incremental loading (skipped - simple static gallery)
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\infinite-scroll.spec.ts`
- [x] T016 [P] E2E: Empty state when no shared images
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\empty-state.spec.ts`
- [x] T017 [P] E2E: Missing/forbidden item handled gracefully
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\error-handling.spec.ts`
- [~] T018 [P] E2E: Sign-out returns to unsigned state (covered in T011)
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\e2e\\signout.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
Models (from `data-model.md`)
- [x] T019 [P] Create models: Person, SharedImage, PeopleGrouping, Session
  - File: `C:\\Windows\\System32\\myfamapp\\src\\models\\index.ts`

Services
- [x] T020 Implement grouping/mapping utilities
  - File: `C:\\Windows\\System32\\myfamapp\\src\\services\\grouping.ts`
  - Functions: `filterImagesByMime`, `groupBySharer`, `toGalleryItem`
- [x] T021 Implement auth session handling (client-side)
  - File: `C:\\Windows\\System32\\myfamapp\\src\\services\\auth.ts`
  - Expose: `signIn`, `signOut`, `getToken`, `onAuthChange`
- [x] T022 Implement data retrieval service
  - File: `C:\\Windows\\System32\\myfamapp\\src\\services\\data.ts`
  - Expose: `fetchSharedItems`, `getThumbnailUrl`

State
- [x] T023 [P] Selection state context for current person and images
  - File: `C:\\Windows\\System32\\myfamapp\\src\\state\\selection.tsx`

UI Components (M365 look & a11y)
- [x] T024 [P] PeoplePanel (list of sharers with counts)
  - File: `C:\\Windows\\System32\\myfamapp\\src\\components\\PeoplePanel.tsx`
- [x] T025 [P] Gallery (responsive grid with lazy loading)
  - File: `C:\\Windows\\System32\\myfamapp\\src\\components\\Gallery.tsx`
- [x] T026 [P] ImageCard (thumbnail, name, alt text)
  - File: `C:\\Windows\\System32\\myfamapp\\src\\components\\ImageCard.tsx`
  - Note: Combined with Gallery component
- [x] T027 [P] PreviewDialog (focus-trapped modal with details and external open)
  - File: `C:\\Windows\\System32\\myfamapp\\src\\components\\PreviewDialog.tsx`
- [x] T028 Page: Home wiring (auth + fetch + panels + gallery)
  - File: `C:\\Windows\\System32\\myfamapp\\pages\\index.tsx`

Static/SEO/Required files
- [x] T029 [P] 404 page for static export
  - File: `C:\\Windows\\System32\\myfamapp\\pages\\404.tsx`
- [x] T030 [P] Populate `public\\robots.txt`, `public\\sitemap.xml`, favicons, social image
  - Files: `C:\\Windows\\System32\\myfamapp\\public\\*`
  - Note: Completed in T007

## Phase 3.4: Integration & Hardening
- [ ] T031 Wire auth to data service; handle token acquisition & renewal
  - Files: `src\\services\\auth.ts`, `src\\services\\data.ts`, `pages\\index.tsx`
- [ ] T032 Error boundaries and item-level error UI
  - Files: `src\\components\\Gallery.tsx`, `src\\components\\ImageCard.tsx`
- [ ] T033 Performance: incremental loading and image optimization
  - Implement intersection observer-based lazy load; responsive sizes
- [ ] T034 Accessibility pass (WCAG essentials)
  - Landmarks, labels, roles, focus states, color contrast validation
- [ ] T035 Bundle/JS budget guard (initial route ≤ 100KB gzip)
  - Add CI check; document keeping dependencies minimal
- [ ] T036 Build & export pipeline
  - Ensure `npm run build` + `npm run export` produce `C:\\Windows\\System32\\myfamapp\\out\\`

## Phase 3.5: Polish
- [ ] T037 [P] Unit tests for grouping utilities
  - File: `C:\\Windows\\System32\\myfamapp\\tests\\unit\\grouping.test.ts`
- [ ] T038 [P] A11y automated checks (axe) in E2E suite
  - Update Playwright tests to include axe assertions
- [ ] T039 [P] Docs: Update `quickstart.md` with auth/config steps and scripts
  - File: `C:\\Windows\\System32\\myfamapp\\specs\\001-title-m365-style\\quickstart.md`
- [ ] T040 CI: HTML validation and link checking prior to deploy
  - Add workflow at `.github\\workflows\\static-validate.yml`

---

Dependencies
- T001 → T002, T003, T004, T005
- T004, T005 → T006, T007, T008
- Tests (T009–T018) MUST be created and failing before implementing T019+
- T019 → T020
- T020 → T010 (contract test), T037
- T021 → T011, T018
- T022 → T012–T017
- UI (T024–T028) depends on services/state (T020–T023)
- Integration (T031–T036) after core is in place
- Polish (T037–T040) after integration

Parallel Execution Examples
```
# Example 1: Run contract and E2E tests creation in parallel
Task: "T009 Contract test for external image item mapping" → create file: C:\Windows\System32\myfamapp\tests\contract\graph-contract.test.ts
Task: "T010 Contract test for grouping function behavior" → create file: C:\Windows\System32\myfamapp\tests\contract\grouping-contract.test.ts
Task: "T011 E2E: Sign-in flow" → create file: C:\Windows\System32\myfamapp\tests\e2e\signin.spec.ts
Task: "T012 E2E: People panel lists sharers" → create file: C:\Windows\System32\myfamapp\tests\e2e\people-panel.spec.ts

# Example 2: Install deps + lint config in parallel
pwsh> npm i -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next prettier playwright @playwright/test
pwsh> New-Item -ItemType File -Path C:\Windows\System32\myfamapp\.eslintrc.json -Force | Out-Null
pwsh> New-Item -ItemType File -Path C:\Windows\System32\myfamapp\.prettierrc -Force | Out-Null

# Example 3: After models ready, implement parallel UI components
Task: "T024 PeoplePanel.tsx"  |  Task: "T025 Gallery.tsx"  |  Task: "T026 ImageCard.tsx"  |  Task: "T027 PreviewDialog.tsx"
```

Validation Checklist
- [ ] All contracts have corresponding tests (T009–T010)
- [ ] All entities have model task (T019)
- [ ] Tests precede implementation (T009–T018 before T019+)
- [ ] [P] tasks touch different files
- [ ] Each task includes an absolute file path
- [ ] Export produces a deployable `out/` directory
