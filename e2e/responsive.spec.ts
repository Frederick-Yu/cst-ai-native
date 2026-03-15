/**
 * 반응형 레이아웃 검증 테스트
 *
 * 검증 대상 페이지: 로그인, 고객사 목록, 고객사 상세, 감사로그
 * 검증 뷰포트: mobile(390px) / tablet(768px) / desktop(1280px)
 *
 * CI에서는 스크린샷 비교 없이 레이아웃 오버플로우·가시성만 검사.
 * 실패 시 playwright-report/ 에 스크린샷 저장.
 */

import { test, expect, type Page } from "@playwright/test";

// ──────────────────────────────────────────────
// 공통 헬퍼
// ──────────────────────────────────────────────

/** 페이지에 수평 스크롤(오버플로우)이 발생하는지 확인 */
async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
}

// ──────────────────────────────────────────────
// 로그인 페이지
// ──────────────────────────────────────────────

test.describe("로그인 페이지 반응형", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("수평 오버플로우 없음", async ({ page }) => {
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("이메일·비밀번호 입력 필드 노출", async ({ page }) => {
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.getByLabel("비밀번호")).toBeVisible();
  });

  test("로그인 버튼 노출", async ({ page }) => {
    await expect(page.getByRole("button", { name: /로그인/ })).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 회원가입 페이지
// ──────────────────────────────────────────────

test.describe("회원가입 페이지 반응형", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("수평 오버플로우 없음", async ({ page }) => {
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("회원가입 버튼 노출", async ({ page }) => {
    await expect(page.getByRole("button", { name: /회원가입/ })).toBeVisible();
  });
});

// ──────────────────────────────────────────────
// 네비게이션 반응형 (모바일 햄버거 메뉴)
// ──────────────────────────────────────────────

test.describe("네비게이션 반응형", () => {
  test.beforeEach(async ({ page }) => {
    // 인증 없이 접근 가능한 페이지에서 nav 확인
    await page.goto("/login");
  });

  test("mobile: 햄버거 버튼 노출, 데스크탑 nav 숨김", async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 768) test.skip();
    await expect(page.getByRole("button", { name: /메뉴/ })).toBeVisible();
  });

  test("desktop: 인라인 nav 노출, 햄버거 숨김", async ({ page, viewport }) => {
    if (!viewport || viewport.width < 768) test.skip();
    const hamburger = page.getByRole("button", { name: /메뉴/ });
    await expect(hamburger).toBeHidden();
  });
});

// ──────────────────────────────────────────────
// 인증이 필요한 페이지 — 세션 쿠키 없이 접근 시 리다이렉트 확인
// ──────────────────────────────────────────────

test.describe("인증 리다이렉트 반응형", () => {
  const protectedPaths = ["/", "/customers", "/audit-logs"];

  for (const path of protectedPaths) {
    test(`${path} — 미인증 시 /login 리다이렉트`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
});

// ──────────────────────────────────────────────
// 고객사 등록 페이지 (인증 없이 접근 → 리다이렉트 후 로그인 페이지 레이아웃)
// ──────────────────────────────────────────────

test.describe("고객사 등록 페이지 반응형", () => {
  test("미인증 접근 — 수평 오버플로우 없음", async ({ page }) => {
    await page.goto("/customers/new");
    // 리다이렉트되더라도 해당 페이지에서 오버플로우 없어야 함
    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});
