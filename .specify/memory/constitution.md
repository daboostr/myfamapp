# Static Web App Constitution

This constitution defines the bare-minimum rules and expectations for any project created from the static web app template.

## Core Principles

### I. Static-Only Delivery
All content must be served as static assets (HTML/CSS/JS/fonts/images) via a CDN or object storage; no server-side execution or dynamic backends. If dynamic features are needed, use client-side APIs only and keep the core experience functional without them.

### II. Template-First
Projects must be instantiated from the approved template and customized via configuration (template variables and content files) rather than one-off rewrites. Template upgrades should be pull-merged without breaking site content.

### III. Simplicity & Portability
Prefer vanilla HTML/CSS/JS and progressive enhancement. Avoid framework lock-in unless justified. The site must build and run with a single command and deploy without custom servers.

### IV. Accessibility & SEO Baseline
Meet basic WCAG 2.1 AA essentials (landmarks, alt text, labels, focus states, contrast) and include minimal SEO metadata (titles, descriptions, canonical, social preview). Accessibility must not regress.

### V. Performance Budget
Ship fast by default: LCP < 2.5s, CLS < 0.1 on a simulated mid-tier device on a typical 4G connection; total JS ≤ 100KB gzip for initial route; images optimized and responsive.

## Minimal Requirements

### 1) Tech Stack
- Markup: HTML5; Styling: CSS3 (optionally with a small utility layer); Scripts: ES2019+ no transpile required.
- Optional bundler/dev server: Vite (vanilla) or none. No SSR/ISR.

### 2) Required Files
- `index.html` (home), `404.html` (fallback), `favicon.ico` or `favicon.svg`.
- `robots.txt`, `sitemap.xml`.
- Basic Open Graph/Twitter meta tags and canonical URL in each page head.

### 3) Project Structure (default)
- `public/` static assets copied as-is (icons, `robots.txt`, `sitemap.xml`).
- `src/` source files (HTML fragments/partials if used, CSS, JS, images). 
- Output directory: `dist/` (or `build/`). The output must be self-contained and deployable.

### 4) Template Variables (minimum set)
- `site_title`, `site_description`, `base_url` (without trailing slash).
- `primary_color`, `accent_color`, `logo_path`, `social_image`.
- `nav_links`: label + href list (top-level only).
- Optional: `analytics_id` (must be disabled by default), `copyright`.

### 5) Pages (minimum)
- Home page with hero, short value proposition, and clear primary CTA.
- Not-found page routed via `404.html` (and SPA fallback if applicable).

### 6) Accessibility Checklist (baseline, non-negotiable)
- Provide page landmarks (`header`, `nav`, `main`, `footer`).
- Meaningful document title and single `h1` per page.
- Text alternatives for non-decorative images.
- Visible focus states; keyboard operable navigation.
- Color contrast ≥ 4.5:1 for body text.

### 7) Performance & Assets
- Optimize images (responsive sizes, modern formats where supported).
- Defer or module-load JS; inline only critical CSS when justified.
- Set caching: static assets ≥ 7 days, HTML no-cache or short max-age with revalidation.

### 8) Build & Run Commands
- Dev: `npm run dev` → local preview (or simple `npx serve public` when bundler is not used).
- Build: `npm run build` → outputs to `dist/`.
- Preview: `npm run preview` (if using Vite) to serve the build locally.

### 9) CI Checks (minimal)
- HTML validation and link checking on all pages.
- Lint CSS/JS (stylelint/eslint if used) with zero errors before deploy.
- Bundle size or total JS size guardrail for initial route.

### 10) Deployment
- Deploy the `dist/` (or `public/` if unbundled) directory to a static host (e.g., GitHub Pages, Netlify, Azure Static Web Apps, Cloudflare Pages).
- Ensure a catch-all/404 routing rule exists; for SPA-style navigation, route unknown paths to `index.html` while serving `404.html` to crawlers where supported.

## Development Workflow
- Initialize from the template and set template variables in the designated config file.
- Edit content in `src/` and static assets in `public/`.
- Run dev server locally; commit small, reviewable changes.
- On PRs: run CI checks; only green PRs can be merged to main.
- Releases deploy automatically from main to the static host.

## Governance
- This constitution supersedes other practices for static sites in this repo.
- Amendments require documenting a rationale, migration notes, and updating the template accordingly.
- All PR reviews must verify adherence to: static-only delivery, A11y baseline, SEO tags, performance budget, and required files.

**Version**: 1.0.0 | **Ratified**: 2025-09-16 | **Last Amended**: 2025-09-16