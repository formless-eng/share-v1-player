'use client';

import { formatUSDCPrice } from "@/app/lib/utils";

/**
 * A card that displays the user's USDC balance and the item price
 */
export function BalanceCard({
  balance,
  price,
}: {
  balance: bigint | undefined;
  price: bigint | undefined;
}) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          USDC Balance
        </span>
        <span className="text-lg font-bold">{formatUSDCPrice(balance)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Price</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatUSDCPrice(price)}
        </span>
      </div>
    </div>
  );
}
