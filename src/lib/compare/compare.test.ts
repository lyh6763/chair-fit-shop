import { describe, expect, it } from "vitest";
import { getChair } from "@/data/chairs";
import type { Chair } from "@/lib/chairs/types";
import {
  addToCompareList,
  compareHref,
  parseCompareParam,
  removeFromCompareList,
  sanitizeCompareList,
} from "./list";
import { buildCompareGroups, onlyDifferences, type CompareRow } from "./rows";

function chairs(...slugs: string[]) {
  return slugs.map((slug) => {
    const chair = getChair(slug);
    if (!chair) throw new Error(`missing chair ${slug}`);
    return chair;
  });
}

function row(groups: ReturnType<typeof buildCompareGroups>, key: string): CompareRow {
  const found = groups.flatMap((group) => group.rows).find((r) => r.key === key);
  if (!found) throw new Error(`missing row ${key}`);
  return found;
}

describe("compare list", () => {
  it("drops unknown and duplicate slugs and keeps at most 3", () => {
    expect(sanitizeCompareList(["adjustable-mesh", "nope", "adjustable-mesh", "desk-mesh", "study-fabric"])).toEqual([
      "adjustable-mesh",
      "desk-mesh",
      "study-fabric",
    ]);
  });

  it("parses the ?m= query value", () => {
    expect(parseCompareParam("adjustable-mesh, desk-mesh")).toEqual(["adjustable-mesh", "desk-mesh"]);
    expect(parseCompareParam("")).toEqual([]);
    expect(parseCompareParam(null)).toEqual([]);
  });

  it("reports why an add did nothing", () => {
    expect(addToCompareList(["adjustable-mesh"], "desk-mesh")).toEqual({ list: ["adjustable-mesh", "desk-mesh"], result: "added" });
    expect(addToCompareList(["adjustable-mesh"], "adjustable-mesh").result).toBe("exists");
    expect(addToCompareList(["adjustable-mesh", "desk-mesh", "study-fabric"], "another-chair")).toEqual({
      list: ["adjustable-mesh", "desk-mesh", "study-fabric"],
      result: "full",
    });
  });

  it("removes and builds shareable links", () => {
    expect(removeFromCompareList(["adjustable-mesh", "desk-mesh"], "adjustable-mesh")).toEqual(["desk-mesh"]);
    expect(compareHref(["adjustable-mesh", "desk-mesh"])).toBe("/compare?m=adjustable-mesh,desk-mesh");
    expect(compareHref([])).toBe("/compare");
  });
});

describe("compare rows", () => {
  it("marks differing rows and the best value", () => {
    const groups = buildCompareGroups(chairs("study-fabric", "adjustable-mesh"));
    const load = row(groups, "load");
    expect(load.values).toEqual(["100 kg", "120 kg"]);
    expect(load.diff).toBe(true);
    expect(load.best).toEqual([1]);
    expect(load.bars).toEqual([100 / 120, 1]);
  });

  it("treats the cheaper price as best", () => {
    expect(row(buildCompareGroups(chairs("adjustable-mesh", "desk-mesh")), "price").best).toEqual([1]);
  });

  it("marks every tied leader, and nobody when all are equal", () => {
    const groups = buildCompareGroups(chairs("adjustable-mesh", "study-fabric", "desk-mesh"));
    expect(row(groups, "load").best).toEqual([0, 2]);
    const officeGroups = buildCompareGroups(chairs("adjustable-mesh", "desk-mesh"));
    expect(row(officeGroups, "headrest").best).toEqual([]);
    expect(row(officeGroups, "headrest").diff).toBe(false);
  });

  it("does not mark diff or best with a single chair", () => {
    const single = buildCompareGroups(chairs("adjustable-mesh"));
    const flagged = single.flatMap((g) => g.rows).filter((r) => r.diff || r.best.length > 0);
    expect(flagged).toEqual([]);
  });

  it("keeps only differing rows and drops empty groups", () => {
    const groups = onlyDifferences(buildCompareGroups(chairs("adjustable-mesh", "desk-mesh")));
    const keys = groups.flatMap((g) => g.rows.map((r) => r.key));
    expect(keys).not.toContain("category");
    expect(keys).not.toContain("headrest");
    expect(keys).toContain("price");
    expect(groups.every((g) => g.rows.length > 0)).toBe(true);
  });

  it("returns one value per chair in order", () => {
    const list: Chair[] = chairs("study-fabric", "adjustable-mesh");
    for (const r of buildCompareGroups(list).flatMap((g) => g.rows)) {
      expect(r.values).toHaveLength(2);
    }
    expect(row(buildCompareGroups(list), "seat").values).toEqual(["420 mm 고정", "420–520 mm"]);
  });
});
