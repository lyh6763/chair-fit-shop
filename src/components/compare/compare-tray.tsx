"use client";

import { usePathname } from "next/navigation";
import { lazy, Suspense } from "react";
import { useCompareList } from "@/lib/compare/store";

/*
 * 트레이 내용(이미지 컴포넌트·의자 데이터·썸네일 경로)은 담긴 모델이 있을 때만 불러온다.
 * 레이아웃에 바로 두면 모든 페이지가 이 코드를 처음부터 받아, 의자를 보여 주지 않는 설문(/fit)도
 * gzip 6.6KB를 더 받았다(2026-11-17 측정). 목록은 브라우저 저장소에서 읽으므로 서버에서는 그리지 않는다.
 */
const CompareTrayPanel = lazy(() =>
  import("./compare-tray-panel").then((mod) => ({ default: mod.CompareTrayPanel })),
);

/** 하단 고정 비교 트레이(O01). 담긴 모델이 있을 때만 나타나고, 비교 페이지에서는 숨긴다. */
export function CompareTray() {
  const pathname = usePathname();
  const list = useCompareList();

  if (!list || list.length === 0 || ["/compare", "/cart", "/order-preview"].includes(pathname)) return null;
  return (
    <Suspense fallback={null}>
      <CompareTrayPanel list={list} />
    </Suspense>
  );
}
