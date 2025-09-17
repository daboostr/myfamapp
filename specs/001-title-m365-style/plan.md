# Implementation Plan: M365-Style OneDrive Photo Sharing Web App

**Branch**: `001-title-m365-style` | **Date**: 2025-09-16 | **Spec**: C:\\Windows\\System32\\myfamapp\\specs\\001-title-m365-style\\spec.md
**Input**: Feature specification from `C:\\Windows\\System32\\myfamapp\\specs\\001-title-m365-style\\spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (if applicable)
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary
Primary requirement: A modern, M365-style, static photo-sharing site showing images shared-with-me, organized by the people who shared them.

Technical approach: Static front-end using a static-export configuration (no servers, no databases). Data for the gallery is provided at runtime from the user’s authorized cloud account; no server persistence. The UI is responsive and mobile-ready.

## Technical Context
**Language/Version**: TypeScript (Next.js), Node.js ≥ 18 for build  
**Primary Dependencies**: Next.js (static export/SSG, no SSR/ISR), Fluent UI–style component library for M365 look, client-side auth, external API client (read-only)  
**Storage**: None (no database). No server-side state.  
**Testing**: E2E (happy-path auth flow, grouping, gallery), basic unit tests for grouping/filtering, linting  
**Target Platform**: Static site on CDN/static host (Next.js `next export` → `out/`)  
**Project Type**: Web (single front-end project)  
**Performance Goals**: LCP < 2.5s, CLS < 0.1 on mid-tier 4G; initial route JS ≤ 100KB gzip; optimized responsive images  
**Constraints**: Static-only (no SSR/ISR) using Next.js export; least-privilege external access; WCAG 2.1 AA essentials; modern, sleek visual style consistent with M365  
**Scale/Scope**: Single-page experience with people panel and image gallery; large collections supported via incremental rendering

## Constitution Check
- Static-Only Delivery: PASS — Exported static assets only; no server-side execution.
- Template-First: PASS — Feature will be realized within the approved static template; customization via config/content files.
- Simplicity & Portability: PASS — Single front-end project; one-command build and deploy; no backend services.
- Accessibility & SEO Baseline: PASS (planned) — Landmarks, titles, alt text, focus, contrast; canonical + social meta.
- Performance Budget: PASS (planned) — Budgets noted; incremental loading; optimized images.
- Required Files: PASS (planned) — `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, favicon & social meta.
- Build/Run Commands: PASS (planned) — `npm run dev`, `npm run build`, static preview.

Re-check after Phase 1: PASS — Design remains static-only and within budgets; A11y/SEO covered.

## Project Structure

### Documentation (this feature)
```
specs/001-title-m365-style/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code (repository root)
- Single web application (static front-end with Next.js):
   - `public/` for static assets (icons, robots, sitemap)
   - `pages/` (or `app/` when compatible) organized for static export (no server functions)
   - `styles/` for CSS
   - Output directory for deployment: `out/` via `next export`

**Structure Decision**: Single front-end static application (no backend)

## Phase 0: Outline & Research (RESOLVED)
Key unknowns and decisions are documented in `research.md`:
- Account scope: Support personal and work/school accounts; delegated, least-privilege access.
- Minimal permissions: Read-only scope sufficient to list items shared-with-me.
- Image formats & fallback: Common formats (jpg/jpeg/png/webp/gif); placeholder when no thumbnail.
- People grouping: Group by sharer identity; disambiguate with available profile info.
- Pagination/large sets: Incremental loading/virtualization to sustain responsiveness.
- Static export compatibility: Use Next.js pages router and features compatible with `next export`; avoid SSR/ISR.

## Phase 1: Design & Contracts (COMPLETED)
- Data model defined for Person, Shared Image, People Grouping, Session (`data-model.md`).
- External data contracts documented for fields required by the UI (`contracts/graph-integration.md`).
- Quickstart guides local development and static build steps (`quickstart.md`) including `next build && next export`.

## Phase 2: Task Planning Approach (DO NOT EXECUTE HERE)
- Use `.specify/templates/tasks-template.md` as base during /tasks.
- Generate tasks from Phase 1 artifacts:
  - Entities → model typing & validation tasks [P]
  - External data contracts → mapping & UI binding tests [P]
  - User stories → E2E scenarios
  - Implementation tasks to satisfy tests
- Ordering: TDD (tests first), then models → services → UI; mark independent tasks [P] for parallelization.
- Estimated Output: 25–30 tasks in `tasks.md` (created by /tasks).

## Complexity Tracking
(None — no constitution deviations.)

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v1.0.0 - See `/.specify/memory/constitution.md`*
