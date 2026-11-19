import { CartContents } from "@/components/cart/cart-contents";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "주문 내용 확인", path: "/order-preview", index: false });

export default function OrderPreviewPage() {
  return (
    <div className="page-container space-y-8 py-10 md:py-14">
      <header className="space-y-2">
        <h1
          id="order-preview-title"
          tabIndex={-1}
          className="scroll-mt-[calc(var(--header-h)+--spacing(2))] text-3xl font-bold tracking-tight md:text-4xl"
        >
          주문 내용 확인
        </h1>
        <p className="text-muted-strong">가상 상품의 색상, 수량, 금액을 확인하는 체험이에요.</p>
      </header>
      <CartContents preview />
    </div>
  );
}
