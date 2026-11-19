import type { Chair } from "../lib/chairs/types";

/** 추천, 비교, 장바구니가 공통으로 읽는 가상 상품 데이터. price의 단위는 원이다. */
export const CHAIRS: readonly Chair[] = [
  {
    slug: "desk-mesh",
    name: "데스크 메쉬 체어",
    category: "office",
    price: 549000,
    releaseDate: "2024-09-02",
    summary: "메쉬 등판과 패브릭 좌판을 갖춘 기본형 사무용 의자입니다.",
    highlights: [
      { title: "메쉬 등판", body: "등판에 공기가 통하는 메쉬를 사용했습니다." },
      { title: "헤드레스트", body: "등판 위에 머리를 기댈 수 있습니다." },
      { title: "3D 팔걸이", body: "높이, 앞뒤 위치, 각도를 조절할 수 있습니다." },
    ],
    colors: [
      { slug: "black", name: "블랙", hex: "#1F1F1F" },
      { slug: "white", name: "화이트", hex: "#F2F0EC" },
    ],
    spec: {
      seatHeightMm: { min: 425, max: 525 },
      seatDepthAdjust: false,
      backHeightMm: 680,
      sizeMm: { w: 680, d: 680, h: { min: 1180, max: 1280 } },
      maxWeightKg: 120,
      armrest: "3d",
      headrest: true,
      lumbar: "adjustable",
      tilt: "synchro",
      backMaterial: "mesh",
      seatMaterial: "fabric",
      base: "nylon",
      warrantyYears: 3,
    },
  },
  {
    slug: "adjustable-mesh",
    name: "조절형 메쉬 체어",
    category: "office",
    price: 829000,
    releaseDate: "2024-10-18",
    summary: "좌판 깊이와 팔걸이 위치를 세밀하게 맞출 수 있는 사무용 의자입니다.",
    highlights: [
      { title: "좌판 깊이 조절", body: "허벅지 길이에 맞춰 좌판을 앞뒤로 옮길 수 있습니다." },
      { title: "4D 팔걸이", body: "높이, 앞뒤 위치, 좌우 위치, 각도를 조절할 수 있습니다." },
      { title: "조절형 요추 패드", body: "허리가 등판에 닿는 위치에 맞춰 패드를 조절할 수 있습니다." },
    ],
    colors: [
      { slug: "black", name: "블랙", hex: "#1F1F1F" },
      { slug: "gray", name: "그레이", hex: "#9E9E9E" },
    ],
    spec: {
      seatHeightMm: { min: 420, max: 520 },
      seatDepthAdjust: true,
      backHeightMm: 700,
      sizeMm: { w: 670, d: 670, h: { min: 1200, max: 1300 } },
      maxWeightKg: 120,
      armrest: "4d",
      headrest: true,
      lumbar: "adjustable",
      tilt: "synchro",
      backMaterial: "mesh",
      seatMaterial: "mesh",
      base: "nylon",
      warrantyYears: 3,
    },
  },
  {
    slug: "study-fabric",
    name: "스터디 패브릭 체어",
    category: "student",
    price: 329000,
    releaseDate: "2023-12-12",
    summary: "420mm 고정 좌판과 썰매형 프레임을 갖춘 학습용 의자입니다.",
    highlights: [
      { title: "420mm 고정 좌판", body: "좌판 높이는 바닥에서 420mm입니다." },
      { title: "분리형 등판", body: "두 등판이 등을 양쪽에서 받쳐줍니다." },
      { title: "썰매형 프레임", body: "바퀴 대신 바닥에 닿는 썰매형 다리를 사용했습니다." },
    ],
    colors: [
      { slug: "black", name: "블랙", hex: "#1F1F1F" },
      { slug: "blue", name: "블루", hex: "#4A6FA5" },
    ],
    spec: {
      seatHeightMm: { min: 420, max: 420 },
      seatDepthAdjust: false,
      backHeightMm: 460,
      sizeMm: { w: 580, d: 560, h: { min: 860, max: 860 } },
      maxWeightKg: 100,
      armrest: "fixed",
      headrest: false,
      lumbar: "dualback",
      tilt: "none",
      backMaterial: "fabric",
      seatMaterial: "fabric",
      base: "sled",
      warrantyYears: 3,
    },
  },
];

export function getChair(slug: string) {
  return CHAIRS.find((chair) => chair.slug === slug);
}
