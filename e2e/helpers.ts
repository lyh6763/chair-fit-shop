import { expect, type Page } from "@playwright/test";

/** 질문 6개를 끝까지 답하고 결과 화면까지 간다. heightDelta만큼 키 + 버튼을 누른다(기본 170cm). */
export async function completeFitFinder(
  page: Page,
  { heightDelta = 2, hours = "9시간 이상", concern = "허리", budget = "80만 원까지" } = {},
) {
  await page.goto("/fit");
  await page.getByRole("button", { name: "시작하기" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "누가 앉나요?" })).toBeVisible();
  await chooseAndContinue(page, /^나/);

  await expect(page.getByRole("heading", { level: 1, name: "키와 체중을 알려주세요" })).toBeVisible();
  for (let i = 0; i < heightDelta; i += 1) {
    await page.getByRole("button", { name: "키 1 늘리기" }).click();
  }
  await page.getByRole("button", { name: "다음" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "하루에 얼마나 앉아 있나요?" })).toBeVisible();
  await chooseAndContinue(page, hours);
  await expect(page.getByRole("heading", { level: 1, name: "주로 무엇을 하나요?" })).toBeVisible();
  await chooseAndContinue(page, /^업무/);

  await expect(page.getByRole("heading", { level: 1, name: "불편한 곳이 있나요?" })).toBeVisible();
  await page.getByRole("button", { name: concern, exact: true }).click();
  await page.getByRole("button", { name: "다음" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "예산은 어느 정도인가요?" })).toBeVisible();
  await chooseAndContinue(page, budget, "결과 보기");
  await expect(page).toHaveURL(/\/fit\/result$/);
}

/** 단일 선택 질문에서 라디오를 고르고 확정 버튼("다음" 또는 "결과 보기")을 누른다. */
export async function chooseAndContinue(page: Page, answer: string | RegExp, submit = "다음") {
  await page.getByRole("radio", { name: answer }).check();
  await page.getByRole("button", { name: submit, exact: true }).click();
}

/** 가로 스크롤이 생기지 않는지 확인한다. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "page should not scroll horizontally").toBeLessThanOrEqual(clientWidth);
}
