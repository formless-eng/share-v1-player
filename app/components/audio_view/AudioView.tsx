'use client';

import { FC, useCallback } from "react";

import { Button } from "@/app/components/button/Button";
import { AssetMetadata } from "@/app/components/shared/AssetMetadata";
import { useAssetContext } from "@/app/contexts/AssetContext";
import { usePlayerContext } from "@/app/contexts/PlayerContext";
import { useAutoplay } from "@/app/hooks/useAutoplay";
import { usePlayerControls } from "@/app/hooks/usePlayerControls";

export const AudioView: FC = () => {
  const assetContext = useAssetContext();
  const playerContext = usePlayerContext();
  const { playSingleTrack, playFromQueue, pause } = usePlayerControls();
  const isPreview = !assetContext.contractGrantActive && Number(assetContext.assetPrice) !== 0;
  const isPlaying =
    assetContext.contractAddress === playerContext.contractAddress && playerContext.playing;


  const handlePlay = useCallback(() => {
    if (assetContext.assetMediaType === "audio") {
      playSingleTrack({
        url: assetContext.assetFileUri,
        artist: assetContext.assetArtist,
        title: assetContext.assetTitle,
        artworkUri: assetContext.assetArtworkUri,
        contractAddress: assetContext.contractAddress,
        networkId: assetContext.networkId,
      });
    } else if (assetContext.assetMediaType === "collection" && assetContext.assetQueue.length > 0) {
      playFromQueue(
        assetContext.assetQueue,
        playerContext.assetQueueIndex || 0,
        assetContext.contractAddress,
        assetContext.networkId,
      );
    }
  }, [assetContext, playerContext.assetQueueIndex, playFromQueue, playSingleTrack]);

  useAutoplay({
    shouldAutoplay: assetContext.autoPlay,
    playerRef: playerContext.playerRef,
    onPlay: handlePlay,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 sm:flex-row">
          <img
            src={assetContext.assetArtworkUri || ""}
            alt={assetContext.assetTitle || "Album artwork"}
            height={220}
            width={220}
            className="aspect-square w-full max-w-[220px] rounded-2xl border border-zinc-200 object-cover"
          />
          <div className="flex flex-1 flex-col justify-between gap-5">
            <AssetMetadata
              title={assetContext.assetTitle}
              artist={assetContext.assetArtist}
              releaseTimestamp={assetContext.assetReleaseTimestamp}
              isPreview={isPreview}
              creatorDisplayName={assetContext.creatorDisplayName}
              creatorUniqueId={assetContext.creatorUniqueId}
              titleSize="lg"
            />
            <div className="max-w-[220px]">
              <Button
                variant="primary"
                onClick={() => (isPlaying ? pause() : handlePlay())}
                label={isPlaying ? "Pause" : "Play"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
