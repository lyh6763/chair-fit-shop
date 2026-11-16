import { Suspense } from "react";
import { StoreBrowser } from "@/components/stores/store-browser";
import { StoreCard } from "@/components/stores/store-card";
import { STORES } from "@/data/stores";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "모델별 전시 매장",
  description: "가상 매장 목록에서 모델별 전시 정보를 확인해 보세요.",
  path: "/stores",
});

export default function StoresPage() {
  return (
    <div className="page-container space-y-10 py-10 md:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">모델별 전시 매장</h1>
        <p className="text-muted">포트폴리오용 가상 매장입니다. 모델을 고르면 해당 모델을 전시한 매장이 표시돼요.</p>
      </header>

      {/* 카드 제목(h3) 위에 목록 제목(h2)을 둬서 h1 → h3로 건너뛰지 않게 한다. 화면에는 보이지 않는다. */}
      <section aria-labelledby="store-list-title">
        <h2 id="store-list-title" className="sr-only">
          매장 목록
        </h2>
        {/* 필터는 URL 쿼리를 읽는 클라이언트 영역이다. 초기 HTML에는 전체 매장을 담는다. */}
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {STORES.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          }
        >
          <StoreBrowser />
        </Suspense>
      </section>
    </div>
  );
}
