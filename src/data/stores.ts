export type Store = {
  id: string;
  name: string;
  region: string;
  displayModels: string[];
};

/**
 * 전시 모델 필터에 사용하는 포트폴리오용 가상 매장.
 * 값의 제약은 stores.test.ts가 store.schema.ts로 검증한다(브라우저에서는 검증하지 않음).
 */
export const STORES: readonly Store[] = [
  {
    id: "gangnam",
    name: "강남 쇼룸",
    region: "서울",
    displayModels: ["q1w", "d3hs", "d2500g", "dk073w", "d043w"],
  },
  {
    id: "seongsu",
    name: "성수 쇼룸",
    region: "서울",
    displayModels: ["q1w", "d2500g"],
  },
  {
    id: "pangyo",
    name: "판교 쇼룸",
    region: "경기",
    displayModels: ["q1w", "d3hs", "d2500g"],
  },
  {
    id: "seomyeon",
    name: "서면 쇼룸",
    region: "부산",
    displayModels: ["d3hs", "dk073w", "d043w"],
  },
  {
    id: "dongseongno",
    name: "동성로 쇼룸",
    region: "대구",
    displayModels: ["q1w", "dk073w"],
  },
];

export function storesWithModel(slug: string) {
  return STORES.filter((store) => store.displayModels.includes(slug));
}
