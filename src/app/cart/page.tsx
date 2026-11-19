import { CartContents } from "@/components/cart/cart-contents";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ title: "장바구니", path: "/cart", index: false });

export default function CartPage() {
  return (
    <div className="page-container space-y-8 py-10 md:py-14">
      <h1 id="cart-title" tabIndex={-1} className="scroll-mt-(--header-h) text-3xl font-bold tracking-tight md:text-4xl">장바구니</h1>
      <CartContents />
    </div>
  );
}
