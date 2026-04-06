/**
 * Collection Item View Component
 * Displays a single track in a collection/playlist
 * Clean, simple, and readable
 */

'use client';

import { FC, useEffect, useState } from "react";
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
  playlistName,
  trackPriceUSD,
  isPurchased = false,
}) => {
  const assetContext = useAssetContext();
  const playerContext = usePlayerContext();
  const { playFromQueue, pause } = usePlayerControls();
  const [isActive, setIsActive] = useState(false);

  // Check if mobile using window width
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 600;

  // Track if this item is currently playing
  useEffect(() => {
    const run = async () => {
      const isThisTrackPlaying =
        playerContext.contractAddress === assetContext.contractAddress &&
        playerContext.playing &&
        itemIndex === playerContext.assetQueueIndex;
      setIsActive(isThisTrackPlaying);
    }
    run();
  }, [
    playerContext.playing,
    playerContext.assetQueueIndex,
    playerContext.contractAddress,
    assetContext.contractAddress,
    itemIndex,
  ]);

  // Play this track
  const handlePlay = () => {
    playFromQueue(
      assetContext.assetQueue,
      itemIndex,
      assetContext.contractAddress,
      assetContext.networkId
    );
  };

  // Toggle play/pause
  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive && playerContext.playing) {
      pause();
    } else {
      handlePlay();
    }
  };

  // Navigate to individual track page (placeholder for future implementation)
  const handleTrackTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Navigate to individual track when available
    // const contractAddress = item.contractAddress || assetContext?.contractAddress;
    // const networkId = item.networkId || assetContext?.networkId;
  };

  // Grid layout depends on mobile/desktop and purchased status
  const gridCols = isMobile
    ? isPurchased
      ? "grid-cols-[auto_auto_1fr]"
      : "grid-cols-[auto_auto_1fr_auto]"
    : isPurchased
      ? "grid-cols-[auto_auto_1fr_1fr]"
      : "grid-cols-[auto_auto_1fr_1fr_auto]";

  return (
    <div
      className={`grid ${gridCols} gap-3 px-4 py-2 rounded-sm items-center transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800`}
      data-testid={`playlist-item${itemIndex}`}
    >
      {/* Play/Pause Button */}
      <div className="w-8 flex justify-center items-center">
        {/* <PlayButtonIcon
          isPlaying={isActive && playerContext.playing}
          onPlay={handlePlay}
          onPause={pause}
          size={"lg"}
        /> */}
        <button onClick={handlePlayPauseClick}>
          {isActive && playerContext.playing ? "Pause" : "Play"}
        </button>
      </div>

      {/* Track Artwork */}
      <div>
        <img
          src={item.image || "/default-audio.png"}
          alt={item.title}
          width={50}
          height={50}
        />
      </div>

      {/* Track Info */}
      <div className="flex items-center min-w-0">
        <div className="flex flex-col min-w-0">
          <span
            className={`${isActive ? "font-medium" : "font-normal"
              } text-sm text-foreground-primary truncate hover:underline cursor-pointer`}
            data-testid={`playlist-item${itemIndex}-title`}
            onClick={handleTrackTitleClick}
          >
            {item.title}
          </span>
          <span
            className="text-sm text-foreground-secondary truncate hover:underline cursor-pointer"
            data-testid={`playlist-item${itemIndex}-artist`}
          >
            {item.artist}
          </span>
        </div>
      </div>

      {/* Playlist Name (hidden on mobile) */}
      {!isMobile && (
        <div className="flex items-center min-w-0">
          <span className="text-sm text-foreground-secondary truncate">
            {playlistName || "Unknown Playlist"}
          </span>
        </div>
      )}

      {/* Price Badge (only if not purchased) */}
      {!isPurchased && (
        <div className="flex justify-end min-w-[3.5rem]">
          <span className="text-xs sm:text-sm font-medium text-foreground-secondary whitespace-nowrap rounded border border-surface-accent/30 px-2 py-0.5">
            {typeof trackPriceUSD === "number" ? `$${trackPriceUSD.toFixed(2)}` : "--"}
          </span>
        </div>
      )}
    </div>
  );
};
