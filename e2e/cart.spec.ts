import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { completeFitFinder, expectNoHorizontalOverflow } from "./helpers";

test("carries a recommended model and its color through the cart to the order preview", async ({ page }) => {
  await completeFitFinder(page);
  await expect(page.getByRole("heading", { level: 2, name: "데스크 메쉬 체어" })).toBeVisible();

  await page.getByRole("button", { name: "상위 3개 비교하기" }).click();
  const table = page.getByRole("table");
  await table.getByRole("link", { name: "데스크 메쉬 체어", exact: true }).press("Enter");
  await expect(page).toHaveURL(/\/chairs\/desk-mesh$/);

  await page.getByRole("button", { name: "화이트", exact: true }).press("Space");
  const quantity = page.getByRole("spinbutton", { name: "수량" });
  await quantity.fill("2");
  await page.getByRole("button", { name: "장바구니 담기" }).press("Enter");
  await page.getByRole("status").getByRole("link", { name: "장바구니 보기" }).press("Enter");
  await expect(page).toHaveURL(/\/cart#cart-title$/);

  const main = page.getByRole("main");
  const cartHeading = main.getByRole("heading", { level: 1, name: "장바구니" });
  const chairLink = main.getByRole("link", { name: "데스크 메쉬 체어" });
  const total = main.getByRole("region", { name: "상품 합계" });
  await expect(main).toContainText("화이트 · 단가 549,000원");
  await expect(total).toContainText("1,098,000원");
  await expect(cartHeading).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(chairLink).toBeFocused();
  const increase = main.getByRole("button", { name: /화이트 수량 늘리기/ });
  await increase.press("Enter");
  await expect(total).toContainText("1,647,000원");
  await page.reload();
  await expect(total).toContainText("1,647,000원");

  await total.getByRole("link", { name: "주문 내용 확인" }).press("Enter");
  await expect(page).toHaveURL(/\/order-preview#order-preview-title$/);
  await expect(total).toContainText("1,647,000원");
  await expect(main.getByRole("heading", { level: 1, name: "주문 내용 확인" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(chairLink).toBeFocused();
  await expect(main).toContainText("화이트");
  await expect(main).toContainText("수량 3개");
  await expect(main.getByRole("button")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual([]);

  await total.getByRole("link", { name: "장바구니로 돌아가기" }).press("Enter");
  await expect(page).toHaveURL(/\/cart#cart-title$/);
  await expect(total).toContainText("1,647,000원");
  await expect(cartHeading).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(chairLink).toBeFocused();
  await main.getByRole("button", { name: /화이트 삭제/ }).press("Enter");
  await expect(cartHeading).toBeFocused();
  await expect(main.getByRole("link", { name: "의자 살펴보기" })).toBeVisible();
});

test("keeps populated checkout pages usable at the target widths", async ({ page }, testInfo) => {
  const widths = testInfo.project.name === "mobile" ? [375, 768] : [1440, 1920];
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") failures.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED") failures.push(request.url());
  });

  for (const width of widths) {
    await test.step(`${width}px`, async () => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/chairs/desk-mesh");
      await page.getByRole("button", { name: "화이트", exact: true }).click();
      await expectNoHorizontalOverflow(page);
      await page.getByRole("button", { name: "장바구니 담기" }).click();
      await page.getByRole("status").getByRole("link", { name: "장바구니 보기" }).click();
      await expectNoHorizontalOverflow(page);
      const main = page.getByRole("main");
      const decrease = main.getByRole("button", { name: /화이트 수량 줄이기/ });
      await main.getByRole("button", { name: /화이트 수량 늘리기/ }).click();
      await decrease.press("Enter");
      await expect(decrease).toBeFocused();
      await expect(decrease).toHaveAttribute("aria-disabled", "true");
      await main.getByRole("link", { name: "주문 내용 확인" }).click();
      await expect(main.getByText("수량 1개")).toBeVisible();
      const heading = main.getByRole("heading", { level: 1, name: "주문 내용 확인" });
      await expect(heading).toBeFocused();
      await expect.poll(() => heading.evaluate((element) => {
        const headerBottom = document.querySelector("body > header")?.getBoundingClientRect().bottom ?? 0;
        return element.getBoundingClientRect().top - headerBottom;
      })).toBeGreaterThanOrEqual(0);
      await expectNoHorizontalOverflow(page);
      await main.getByRole("link", { name: "장바구니로 돌아가기" }).click();
      await main.getByRole("button", { name: /화이트 삭제/ }).click();
      await expect(main.getByRole("link", { name: "의자 살펴보기" })).toBeVisible();
    });
  }
  expect(failures).toEqual([]);
});
