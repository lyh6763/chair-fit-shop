import { expect, test } from "@playwright/test";
import { completeFitFinder } from "./helpers";

test.describe("Stores", () => {
  test("filters stores by displayed model", async ({ page }) => {
    await page.goto("/stores");
    const cards = page.getByRole("main").getByRole("article");
    await expect(cards).toHaveCount(5);

    const filter = page.getByRole("navigation", { name: "모델별 매장 필터" });
    await filter.getByRole("link", { name: "스터디 패브릭 체어" }).click();
    await expect(page).toHaveURL(/\/stores\?model=study-fabric$/);
    await expect(filter.getByRole("link", { name: "스터디 패브릭 체어" })).toHaveAttribute("aria-current", "page");
    await expect(cards).toHaveCount(2);
    await expect(page.getByText("스터디 패브릭 체어 전시 매장 2곳")).toBeVisible();

    await filter.getByRole("link", { name: "전체" }).click();
    await expect(cards).toHaveCount(5);
  });

  test("links from a chair page to the stores that display it", async ({ page }) => {
    await page.goto("/chairs/desk-mesh");
    await page.getByRole("link", { name: /전시 매장 3곳 보기/ }).click();
    await expect(page).toHaveURL(/model=desk-mesh$/);
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(3);
  });

  test("marks stores that display the visitor's top match", async ({ page }) => {
    await completeFitFinder(page);
    await page.goto("/stores");
    // 1순위 데스크 메쉬 체어는 강남·판교·서면에 전시돼 있다
    await expect(page.getByRole("article").filter({ hasText: "내 추천 1순위 모델 전시 중" })).toHaveCount(3);
  });

  test("labels the stores as fictional and omits contact details", async ({ page }) => {
    await page.goto("/stores");
    await expect(page.getByText(/포트폴리오용 가상 매장입니다/)).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.getByText("영업시간", { exact: true })).toHaveCount(0);
    await expect(page.getByText("주소", { exact: true })).toHaveCount(0);
  });
});
