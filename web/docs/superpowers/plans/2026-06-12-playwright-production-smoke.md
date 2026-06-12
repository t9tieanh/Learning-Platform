# Playwright Production Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-safe Playwright E2E smoke tests for the deployed React/Vite/TypeScript frontend.

**Architecture:** Playwright runs directly against `BASE_URL` from `.env.e2e` or CI secrets, with no local dev server. Tests use stable locators and skip authenticated flows when test account env vars are missing.

**Tech Stack:** React, Vite, TypeScript, React Router, Playwright, dotenv, cross-env, GitHub Actions.

---

### Task 1: Configuration And Scripts

**Files:**
- Modify: `playwright.config.ts`
- Create: `.env.e2e.example`
- Modify: `.gitignore`
- Modify: `package.json`
- Create: `.github/workflows/playwright-smoke.yml`

- [ ] Update Playwright to require `BASE_URL`, use `testDir: './tests'`, no `webServer`, Chromium desktop, trace/screenshots/video, list/html reporters, CI retries/workers.
- [ ] Add `.env.e2e.example` with base URL and optional role account variables.
- [ ] Ensure local Playwright artifacts and `.env.e2e` are ignored.
- [ ] Add local, headed, UI, report, production, and staging scripts.
- [ ] Add a GitHub Actions smoke workflow using `E2E_BASE_URL` and optional test account secrets.

### Task 2: Stable Locators

**Files:**
- Modify: `src/components/Auth/SignInForm/index.tsx`
- Modify: `src/components/AllCourse/FilterSidebar.tsx`
- Modify: `src/components/AllCourse/CourseCard.tsx`
- Modify: `src/components/Course/Cover/index.tsx`
- Modify: `src/components/Course/CoursePurchaseBox/index.tsx`

- [ ] Add `data-testid` to login email/password inputs and submit button.
- [ ] Add `data-testid` to course search input and course cards.
- [ ] Add `data-testid` to the course detail title and add-to-cart button.
- [ ] Keep layout, styles, and business logic unchanged.

### Task 3: E2E Tests

**Files:**
- Delete: `tests/example.spec.ts`
- Create: `tests/helpers/auth.helper.ts`
- Create: `tests/smoke/prod-smoke.spec.ts`
- Create: `tests/auth/login.spec.ts`
- Create: `tests/courses/courses.spec.ts`

- [ ] Write an auth helper that navigates to `/auth`, fills credentials, submits, and waits for a redirect or proof of login.
- [ ] Write production smoke tests for `/`, `/auth`, `/courses`, `/my-cart`, and optional first course detail.
- [ ] Write login tests for form visibility, invalid login error, and optional real student login.
- [ ] Write course tests for listing, empty/error handling, search input, and optional detail navigation.
- [ ] Avoid destructive actions such as checkout, create, approve, delete, or real payment.

### Task 4: Verification

**Files:**
- Generated: `playwright-report/`
- Generated: `test-results/`

- [ ] Run `npm run build`.
- [ ] Run `npm run lint`; if unrelated existing lint issues remain, report them clearly.
- [ ] Run Playwright smoke against `BASE_URL` when configured.
- [ ] If smoke fails, inspect the failure output and fix selectors or route assumptions until the production smoke test passes, unless blocked by missing env/data.
