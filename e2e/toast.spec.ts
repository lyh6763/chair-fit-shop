import { expect, test } from "@playwright/test";

test("keeps the undo action until focus leaves the notice", async ({ page }) => {
  await page.clock.install();
  await page.goto("/compare?m=q1w,d3hs");

  const clear = page.getByRole("button", { name: "비우기", exact: true });
  const undo = page.getByRole("status").getByRole("button", { name: "되돌리기", exact: true });
  await clear.press("Enter");
  await undo.focus();
  await page.clock.fastForward(4500);
  await expect(undo).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/m=q1w,d3hs$/);
  await expect(undo).toHaveCount(0);

  await clear.press("Enter");
  await undo.focus();
  await page.clock.fastForward(4500);
  await page.keyboard.press("Shift+Tab");
  await expect(undo).not.toBeFocused();
  await expect(undo).toBeVisible();
  await page.clock.fastForward(4500);
  await expect(undo).toHaveCount(0);
});

test("preserves the ordinary timeout and pauses when a notice link is focused", async ({ page }) => {
  await page.clock.install();
  await page.goto("/chairs");

  const status = page.getByRole("status");
  await page.getByRole("button", { name: "Q1W 메쉬 비교에 담기" }).press("Enter");
  await expect(status).toContainText("비교에 담았어요");
  await page.clock.fastForward(4500);
  await expect(status).toBeEmpty();

  await page.getByRole("button", { name: "D3-HS 메쉬 비교에 담기" }).press("Enter");
  const compare = status.getByRole("link", { name: "비교하기", exact: true });
  await compare.focus();
  await page.clock.fastForward(4500);
  await expect(compare).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/compare\?m=q1w,d3hs$/);
});
