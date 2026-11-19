import type { Chair } from "../chairs/types";

/** 장바구니 한 줄은 상품 목록의 모델과 그 모델에서 고른 색상을 참조한다. */
export type CartLine = {
  chairSlug: Chair["slug"];
  colorSlug: Chair["colors"][number]["slug"];
  quantity: number;
};
