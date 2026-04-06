'use client';

import { formatUSDCPrice } from "@/app/lib/utils";

export function BalanceCard({
  balance,
  price,
}: {
  balance: bigint | undefined;
  price: bigint | undefined;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-500">USDC Balance</span>
        <span className="text-base font-semibold text-zinc-900">{formatUSDCPrice(balance)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Price</span>
        <span className="text-sm font-medium text-zinc-900">{formatUSDCPrice(price)}</span>
      </div>
    </div>
  );
}
