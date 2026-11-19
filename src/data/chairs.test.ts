import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chairViews, recommendedHeightRange } from "@/lib/chairs/format";
import { chairSchema } from "@/lib/chairs/schema";
import { CHAIRS } from "./chairs";

describe("chair data", () => {
  // 브라우저는 데이터를 다시 검증하지 않으므로, 값의 제약은 여기서(CI에서 머지 전에) 검증한다
  it.each(CHAIRS.map((chair) => [chair.slug, chair]))("%s satisfies the chair schema", (_, chair) => {
    const result = chairSchema.safeParse(chair);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it("has unique slugs", () => {
    const slugs = CHAIRS.map((chair) => chair.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has every color × angle image in public/", () => {
    for (const chair of CHAIRS) {
      for (const color of chair.colors) {
        for (const view of chairViews(chair, color.slug)) {
          expect(existsSync(join("public", view.src)), view.src).toBe(true);
        }
      }
    }
  });

  it("derives the recommended height ranges from the three demo chairs", () => {
    const ranges = Object.fromEntries(
      CHAIRS.map((chair) => [chair.slug, recommendedHeightRange(chair.spec)]),
    );
    expect(ranges).toEqual({
      "adjustable-mesh": { min: 158, max: 198 },
      "desk-mesh": { min: 160, max: 200 },
      "study-fabric": { min: 152, max: 164 },
    });
  });
});
