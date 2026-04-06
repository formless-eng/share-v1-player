'use client';

import { FC, useEffect } from "react";

import { AssetMetadata } from "@/app/components/shared/AssetMetadata";
import { VideoPlayer } from "@/app/components/video_player/VideoPlayer";
import { useAssetContext } from "@/app/contexts/AssetContext";
import { usePlayerContextDispatch } from "@/app/contexts/PlayerContext";

export const VideoView: FC = () => {
  const playerContextDispatch = usePlayerContextDispatch();
  const assetContext = useAssetContext();

  const isPreview = !assetContext.contractGrantActive && Number(assetContext.assetPrice) !== 0;

  useEffect(() => {
    playerContextDispatch({ type: "PLAYER_SET_PLAYING", playing: false });
  }, [playerContextDispatch]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <VideoPlayer />
        <div className="p-5 sm:p-6">
          <AssetMetadata
            title={assetContext.assetTitle}
            artist={assetContext.assetArtist}
            releaseTimestamp={assetContext.assetReleaseTimestamp}
            isPreview={isPreview}
            creatorDisplayName={assetContext.creatorDisplayName}
            creatorUniqueId={assetContext.creatorUniqueId}
            titleSize="md"
          />
        </div>
      </div>
    </div>
  );
};
