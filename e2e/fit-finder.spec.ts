import { expect, test } from "@playwright/test";
import { chooseAndContinue, completeFitFinder } from "./helpers";

test.describe("Fit Finder", () => {
  test("recommends a chair with its reasons and score breakdown", async ({ page }) => {
    await completeFitFinder(page, { heightDelta: 2 });

    // 172cm × 2.5 + 25 = 455mm
    const heading = page.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" });
    await expect(heading).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("list", { name: "입력한 정보" }).getByRole("link").first()).toBeFocused();
    await expect(page.locator("main")).toContainText("455mm");

    // 예산 80만 원 안에서 9시간·업무·허리 → 데스크 메쉬 체어(54만 9천 원)
    const top = page.getByRole("heading", { level: 2, name: "데스크 메쉬 체어" });
    await expect(top).toBeVisible();

    const breakdown = page.getByText("점수 구성").locator("..").locator("..");
    await expect(breakdown).toContainText("체형 적합");
    await expect(breakdown).toContainText("합계");

    // 결과는 새로고침해도 유지된다(localStorage)
    await page.reload();
    await expect(top).toBeVisible();
    await expect(heading).not.toBeFocused();
  });

  test("deletes the saved profile and lets the visitor undo it", async ({ page }) => {
    await completeFitFinder(page);
    const stored = () =>
      page.evaluate(() => ({
        profile: localStorage.getItem("chair-fit-shop:profile"),
        draft: sessionStorage.getItem("chair-fit-shop:draft"),
      }));
    const before = await stored();
    expect(before.profile).not.toBeNull();

    await page.getByRole("button", { name: "내 정보 지우기" }).click();

    // 저장소에서 지워지고, 빈 화면의 제목으로 포커스가 옮겨진다
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeFocused();
    await expect(page.locator("main")).toContainText("저장된 키·체중과 답변을 모두 지웠어요");
    expect(await stored()).toEqual({ profile: null, draft: null });

    // 실수로 눌렀다면 토스트에서 되돌린다
    await expect(page.getByRole("status")).toContainText("저장된 내 정보를 지웠어요");
    await page.getByRole("button", { name: "되돌리기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();
    expect(await stored()).toEqual(before);

    // 지운 뒤 새로고침해도 결과가 돌아오지 않는다
    await page.getByRole("button", { name: "내 정보 지우기" }).click();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeVisible();
  });

  test("removes a saved result from the tab that created it when another tab deletes it", async ({ page, context }) => {
    await completeFitFinder(page);
    const otherTab = await context.newPage();
    await otherTab.goto("/fit/result");
    await expect(otherTab.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();

    await otherTab.getByRole("button", { name: "내 정보 지우기" }).press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeVisible();
    await otherTab.getByRole("status").getByRole("button", { name: "되돌리기" }).press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();

    await otherTab.evaluate(() => localStorage.clear());
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeVisible();
  });

  test("keeps the current result in memory when the browser refuses to save it", async ({ page }) => {
    await page.addInitScript(() => {
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (this === localStorage && key === "chair-fit-shop:profile") {
          throw new DOMException("Storage quota exceeded", "QuotaExceededError");
        }
        setItem.call(this, key, value);
      };
    });

    await completeFitFinder(page);
    await expect(page.getByRole("heading", { level: 1, name: "당신의 권장 좌판 높이" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "아직 결과가 없어요" })).toBeVisible();
  });

  test("moves focus to each question for screen readers", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "누가 앉나요?" })).toBeFocused();
    await chooseAndContinue(page, /^나/);
    await expect(page.getByRole("heading", { level: 1, name: "키와 체중을 알려주세요" })).toBeFocused();
  });

  test("changes a single answer with arrow keys and confirms it with the next button", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    const question = page.getByRole("group", { name: "누가 앉나요?" });
    const self = question.getByRole("radio", { name: /^나/ });
    const child = question.getByRole("radio", { name: /^자녀/ });

    // 제목 다음 Tab은 라디오 묶음으로 들어가고, 방향키는 선택만 바꾼다
    await expect(page.getByRole("heading", { level: 1, name: "누가 앉나요?" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(self).toBeFocused();
    await expect(self).not.toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(child).toBeFocused();
    await expect(child).toBeChecked();
    await page.keyboard.press("ArrowUp");
    await expect(self).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(page).toHaveURL(/step=1/);

    // 묶음은 Tab 한 번으로 빠져나와 확정 버튼에 닿는다
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "다음", exact: true })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { level: 1, name: "키와 체중을 알려주세요" })).toBeFocused();
    await expect(page.getByRole("slider", { name: "키" })).toHaveValue("145");
  });

  test("asks for an answer before confirming a single choice", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "답을 하나 골라주세요" })).toBeVisible();
    await expect(page).toHaveURL(/step=1/);

    await page.getByRole("radio", { name: /^나/ }).check();
    await expect(page.getByRole("alert").filter({ hasText: "답을 하나 골라주세요" })).toHaveCount(0);
  });

  test("keeps answers when going back a step", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await chooseAndContinue(page, /^자녀/);
    await page.getByRole("button", { name: "← 이전" }).click();
    await expect(page).toHaveURL(/step=1/);
    await expect(page.getByRole("radio", { name: /^자녀/ })).toBeChecked();
  });

  test("asks for a choice before leaving the concerns step", async ({ page }) => {
    await page.goto("/fit?preset=back");
    // 프리셋은 누가 앉는지 + 불편 부위를 채운다. 2~4단계를 지나 5단계까지 간다
    await page.getByRole("button", { name: "다음" }).click();
    await chooseAndContinue(page, "3~6시간");
    await chooseAndContinue(page, /^공부/);
    await expect(page.getByRole("heading", { level: 1, name: "불편한 곳이 있나요?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "허리", exact: true })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "허리", exact: true }).click();
    await page.getByRole("button", { name: "다음" }).click();
    // Next.js의 라우트 안내 영역도 role="alert"라서 문구로 좁힌다
    await expect(page.getByRole("alert").filter({ hasText: "하나 이상 골라주세요" })).toBeVisible();
    await expect(page).toHaveURL(/step=5/);
  });

  test("starts a child preset with child-sized defaults", async ({ page }) => {
    await page.goto("/fit?preset=kid");
    await expect(page).toHaveURL(/step=2/);
    await expect(page.getByRole("slider", { name: "키" })).toHaveValue("145");
  });

  test("sends a deep link to the first unanswered question", async ({ page }) => {
    await page.goto("/fit?step=5");
    await expect(page).toHaveURL(/step=1/);
  });

  test("offers to resume an unfinished session", async ({ page }) => {
    await page.goto("/fit");
    await page.getByRole("button", { name: "시작하기" }).click();
    await chooseAndContinue(page, /^나/);
    // 1단계에도 "다음"이 있으므로 2단계로 바뀐 뒤에 누른다
    await expect(page.getByRole("heading", { level: 1, name: "키와 체중을 알려주세요" })).toBeVisible();
    await page.getByRole("button", { name: "다음" }).click();
    await expect(page).toHaveURL(/step=3/);

    await page.goto("/fit");
    await page.getByRole("link", { name: /이어서 하기 \(2\/6 완료\)/ }).click();
    await expect(page).toHaveURL(/step=3/);
  });

  test("shows the saved fit on chair pages", async ({ page }) => {
    await completeFitFinder(page);
    await page.goto("/chairs/adjustable-mesh");
    await expect(page.getByText("나와의 핏")).toBeVisible();
    await expect(page.getByRole("figure").first()).toContainText("권장 높이 455mm");
  });
});
