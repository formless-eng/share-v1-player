'use client';

import { FC } from "react";

import { useAssetContext } from "@/app/contexts/AssetContext";
import { usePlayerContext } from "@/app/contexts/PlayerContext";
import { usePlayerControls } from "@/app/hooks/usePlayerControls";

interface CollectionItemViewProps {
  itemIndex: number;
  item: {
    image: string;
    title: string;
    audio: string;
    artist: string;
    name?: string;
    contractAddress?: string;
    networkId?: number;
  };
  playlistName?: string;
  trackPriceUSD?: number | null;
  isPurchased?: boolean;
}

export const CollectionItemView: FC<CollectionItemViewProps> = ({
  itemIndex,
  item,
  trackPriceUSD,
  isPurchased = false,
}) => {
  const assetContext = useAssetContext();
  const playerContext = usePlayerContext();
  const { playFromQueue, pause } = usePlayerControls();
  const isActive =
    playerContext.contractAddress === assetContext.contractAddress &&
    playerContext.playing &&
    itemIndex === playerContext.assetQueueIndex;

  const handlePlayPauseClick = () => {
    if (isActive && playerContext.playing) {
      pause();
      return;
    }

    playFromQueue(assetContext.assetQueue, itemIndex, assetContext.contractAddress, assetContext.networkId);
  };

  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2"
      data-testid={`playlist-item${itemIndex}`}
    >
      <button
        onClick={handlePlayPauseClick}
        className="min-w-[52px] rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700"
      >
        {isActive && playerContext.playing ? "Pause" : "Play"}
      </button>

      <div className="flex min-w-0 items-center gap-3">
        <img
          src={item.image || "/default-audio.png"}
          alt={item.title}
          width={42}
          height={42}
          className="h-[42px] w-[42px] rounded-lg border border-zinc-200 object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
          <p className="truncate text-xs text-zinc-600">{item.artist}</p>
        </div>
      </div>

      {!isPurchased && (
        <span className="whitespace-nowrap rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600">
          {typeof trackPriceUSD === "number" ? `$${trackPriceUSD.toFixed(2)}` : "--"}
        </span>
      )}
    </div>
  );
};
