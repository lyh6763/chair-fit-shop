"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { cartItems, cartLineKey, MAX_QUANTITY } from "@/lib/cart/cart";
import { cartActions, cartStore } from "@/lib/cart/store";
import { chairImage, formatPrice } from "@/lib/chairs/format";

export function CartContents({ preview = false }: { preview?: boolean }) {
  const lines = cartStore.useValue();
  if (lines === undefined) return <p aria-busy="true">상품을 불러오는 중이에요.</p>;

  const items = cartItems(lines ?? []);
  if (items.length === 0) {
    return (
      <div className="space-y-4 rounded-lg bg-surface p-6">
        <p>장바구니에 담긴 의자가 없어요.</p>
        <Link href="/chairs" className={buttonClass()}>의자 살펴보기</Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  function removeItem(key: string, button: HTMLButtonElement) {
    if (document.activeElement === button) {
      const buttons = Array.from(button.closest("ul")?.querySelectorAll<HTMLButtonElement>("[data-cart-remove]") ?? []);
      const index = buttons.indexOf(button);
      (buttons[index + 1] ?? buttons[index - 1] ?? document.getElementById("cart-title"))?.focus();
    }
    cartActions.remove(key);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-start">
      <ul aria-label="담은 상품" className="divide-y divide-line rounded-lg border border-line bg-elevated">
        {items.map(({ line, chair, color, subtotal }) => {
          const key = cartLineKey(line);
          const itemName = `${chair.name} ${color.name}`;
          return (
            <li key={key} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 p-4 sm:p-6">
              <Image
                src={chairImage(chair, color.slug)}
                alt=""
                width={96}
                height={96}
                sizes="(min-width: 640px) 96px, 64px"
                className="size-16 rounded-sm bg-photo object-contain sm:size-24"
              />
              <div className="min-w-0 space-y-3">
                <div className="space-y-1">
                  <h2 className="font-bold">
                    <Link href={`/chairs/${chair.slug}`} className="hover:underline">{chair.name}</Link>
                  </h2>
                  <p className="text-sm text-muted-strong">{color.name} · 단가 {formatPrice(chair.price)}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                  {preview ? <p>수량 {line.quantity}개</p> : (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <div role="group" aria-label={`${itemName} 수량 조절`} className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`${itemName} 수량 줄이기`}
                          aria-disabled={line.quantity === 1}
                          onClick={() => cartActions.setQuantity(key, line.quantity - 1)}
                          className="grid size-11 place-items-center rounded-sm border border-line aria-disabled:opacity-50"
                        >
                          −
                        </button>
                        <span aria-live="polite" className="min-w-7 text-center tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`${itemName} 수량 늘리기`}
                          aria-disabled={line.quantity === MAX_QUANTITY}
                          onClick={() => cartActions.setQuantity(key, line.quantity + 1)}
                          className="grid size-11 place-items-center rounded-sm border border-line aria-disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        data-cart-remove=""
                        aria-label={`${itemName} 삭제`}
                        onClick={(event) => removeItem(key, event.currentTarget)}
                        className={buttonClass({ size: "s", variant: "ghost" })}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                  <p className="font-semibold tabular-nums">{formatPrice(subtotal)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="order-total-title" className="space-y-4 rounded-lg border border-line bg-surface p-5">
        <h2 id="order-total-title" className="text-lg font-bold">상품 합계</h2>
        <p aria-live="polite" className="text-2xl font-bold tabular-nums">{formatPrice(total)}</p>
        <Link href={preview ? "/cart" : "/order-preview"} className={buttonClass({ fullWidth: true })}>
          {preview ? "장바구니로 돌아가기" : "주문 내용 확인"}
        </Link>
      </section>
    </div>
  );
}
