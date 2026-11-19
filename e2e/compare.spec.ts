import { expect, test, type Page } from "@playwright/test";
import { completeFitFinder } from "./helpers";

function addButton(page: Page, name: string) {
  return page.getByRole("button", { name: `${name} 비교에 담기` });
}

/** 모델 열 머리글만 센다. 그룹 머리글(기본·체형 등)도 columnheader이므로 thead로 한정한다. */
const modelHeaders = (page: Page) => page.getByRole("table").locator("thead").getByRole("columnheader");

const toast = (page: Page) => page.getByRole("status").filter({ hasText: /\S/ });

test.describe("Compare", () => {
  test("fills the comparison tray with all three chairs", async ({ page }) => {
    await page.goto("/chairs");

    await addButton(page, "조절형 메쉬 체어").click();
    await expect(addButton(page, "조절형 메쉬 체어")).toHaveAttribute("aria-pressed", "true");
    await expect(toast(page)).toContainText("비교에 담았어요 · 1/3");
    await expect(page.getByRole("complementary", { name: "비교 목록" })).toContainText("하나 더 담아주세요");

    await addButton(page, "데스크 메쉬 체어").click();
    await addButton(page, "스터디 패브릭 체어").click();
    await expect(toast(page)).toContainText("3/3");

    await page.getByRole("complementary", { name: "비교 목록" }).getByRole("link", { name: /비교하기/ }).click();
    await expect(page).toHaveURL(/\/compare\?m=adjustable-mesh,desk-mesh,study-fabric$/);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(modelHeaders(page)).toHaveCount(3);
  });

  test("filters to differing rows and marks the best value", async ({ page }) => {
    await page.goto("/compare?m=adjustable-mesh,desk-mesh");
    const table = page.getByRole("table");
    const rows = table.locator("tbody").getByRole("row");
    await expect(rows.first()).toBeVisible();
    const rowsBefore = await rows.count();

    await page.getByRole("switch", { name: "차이 나는 항목만" }).click();
    await expect(page.getByRole("switch", { name: "차이 나는 항목만" })).toHaveAttribute("aria-checked", "true");
    await expect.poll(() => rows.count()).toBeLessThan(rowsBefore);

    await expect(table.getByRole("cell", { name: /549,000원 \(가장 유리\)/ })).toBeVisible();
    await expect(table.getByText("최대 하중", { exact: true })).toHaveCount(0);
  });

  test("keeps one table and preserves focus when its container resizes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/compare?m=adjustable-mesh,desk-mesh,study-fabric");
    const table = page.getByRole("table");
    await expect(page.locator("main table")).toHaveCount(1);
    await expect(modelHeaders(page)).toHaveCount(3);

    const priceHeader = table.getByRole("rowheader", { name: /가격/ });
    const remove = table.getByRole("button", { name: "조절형 메쉬 체어 비교에서 빼기" });
    await expect(priceHeader).toBeVisible();
    await remove.focus();

    // 뷰포트는 그대로 두고 표의 부모 너비만 변경한다.
    await table.evaluate((element) => { element.parentElement!.style.maxWidth = "650px"; });
    await expect(priceHeader).toHaveCount(0);
    await expect(table.getByRole("cell", { name: /가격.*549,000원/ })).toBeVisible();
    await expect(remove).toBeFocused();

    await table.evaluate((element) => { element.parentElement!.style.maxWidth = "700px"; });
    await expect(priceHeader).toBeVisible();
    await expect(remove).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(table.getByRole("link", { name: "조절형 메쉬 체어", exact: true })).toBeFocused();
  });

  test("removes a chair, syncs the URL, and undoes", async ({ page }) => {
    await page.goto("/compare?m=adjustable-mesh,desk-mesh,study-fabric");
    await page.getByRole("button", { name: "데스크 메쉬 체어 비교에서 빼기" }).press("Enter");
    await expect(page).toHaveURL(/m=adjustable-mesh,study-fabric$/);
    await expect(page.getByRole("link", { name: "+ 모델 추가" })).toBeVisible();
    await expect(page.getByRole("button", { name: "스터디 패브릭 체어 비교에서 빼기" })).toBeFocused();

    await toast(page).getByRole("button", { name: "되돌리기" }).press("Space");
    await expect(page).toHaveURL(/m=adjustable-mesh,study-fabric,desk-mesh$/);
    await expect(page.getByRole("heading", { level: 1, name: "비교" })).toBeFocused();
  });

  test("returns focus to the heading when the comparison becomes empty", async ({ page }) => {
    await page.goto("/compare?m=adjustable-mesh");
    const heading = page.getByRole("heading", { level: 1, name: "비교" });
    const undo = toast(page).getByRole("button", { name: "되돌리기" });

    await page.getByRole("button", { name: "조절형 메쉬 체어 비교에서 빼기" }).press("Enter");
    await expect(page.getByText("비교할 의자를 담아주세요")).toBeVisible();
    await expect(heading).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "의자 보러 가기" })).toBeFocused();

    await undo.press("Space");
    await expect(modelHeaders(page)).toHaveCount(1);
    await expect(heading).toBeFocused();

    await page.getByRole("button", { name: "비우기" }).press("Enter");
    await expect(page.getByText("비교할 의자를 담아주세요")).toBeVisible();
    await expect(heading).toBeFocused();
    await undo.press("Space");
    await expect(modelHeaders(page)).toHaveCount(1);
    await expect(heading).toBeFocused();
  });

  test("keeps the visitor's list when a shared link has no valid models", async ({ page }) => {
    await page.goto("/compare?m=desk-mesh,study-fabric");
    await expect(modelHeaders(page)).toHaveCount(2);

    await page.goto("/compare?m=nope,also-bad");
    await expect(page).toHaveURL(/m=desk-mesh,study-fabric$/);
    await expect(modelHeaders(page)).toHaveCount(2);
  });

  test("compares the top three from the Fit result, with undo", async ({ page }) => {
    await page.goto("/compare?m=study-fabric");
    const nav = page.getByRole("navigation", { name: "주요 메뉴" });
    await expect(nav.getByRole("link", { name: /비교 1/ })).toHaveAttribute("href", "/compare?m=study-fabric");
    await completeFitFinder(page);

    await page.getByRole("button", { name: "상위 3개 비교하기" }).click();
    await expect(page).toHaveURL(/\/compare\?m=desk-mesh,/);
    await expect(page.getByRole("row", { name: /나와의 적합도/ })).toBeVisible();

    await toast(page).getByRole("button", { name: "되돌리기" }).click();
    await expect(page).toHaveURL(/m=study-fabric$/);
  });

  test("shows an empty state with nothing to compare", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText("비교할 의자를 담아주세요")).toBeVisible();
  });

  test("loads the tray on demand on pages without chairs, such as the survey", async ({ page }) => {
    // 트레이 내용은 담긴 모델이 있을 때만 불러온다. 의자를 보여 주지 않는 /fit은 그 코드를 미리 받지 않으므로 여기서 확인한다
    await page.goto("/fit");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "비교 목록" })).toHaveCount(0);

    await page.evaluate(() => localStorage.setItem("chair-fit-shop:compare", JSON.stringify(["adjustable-mesh", "desk-mesh", "study-fabric"])));
    await page.reload();
    const tray = page.getByRole("complementary", { name: "비교 목록" });
    await expect(tray.getByRole("link", { name: /비교하기/ })).toHaveAttribute("href", "/compare?m=adjustable-mesh,desk-mesh,study-fabric");
    await expect(tray.getByRole("img", { name: "조절형 메쉬 체어" })).toBeVisible();

    const next = tray.getByRole("button", { name: "데스크 메쉬 체어 비교에서 빼기" });
    await tray.getByRole("button", { name: "조절형 메쉬 체어 비교에서 빼기" }).press("Enter");
    await expect(next).toBeFocused();
    await tray.getByRole("button", { name: /^스터디 패브릭 체어 비교에서 빼기$/ }).press("Space");
    await expect(tray).toContainText("하나 더 담아주세요");
    await expect(next).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(tray).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "주요 메뉴" }).getByRole("link", { name: "비교", exact: true })).toBeFocused();
  });
});
