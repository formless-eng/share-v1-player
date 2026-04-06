/**
 * Video View Component
 * Displays video assets with playback and metadata
 * Clean and simple implementation
 */

'use client';

import { FC, useEffect } from "react";
import { isMobile } from "react-device-detect";

import { VideoPlayer } from "@/app/components/video_player/VideoPlayer";
import { useAssetContext } from "@/app/contexts/AssetContext";
import { usePlayerContextDispatch } from "@/app/contexts/PlayerContext";
import { AssetMetadata } from "@/app/components/shared/AssetMetadata";

export const VideoView: FC = () => {
  const playerContextDispatch = usePlayerContextDispatch();
  const assetContext = useAssetContext();

  // Determine if this is a preview (user hasn't paid)
  const isPreview = !assetContext.contractGrantActive && Number(assetContext.assetPrice) !== 0;

  // Pause the audio player when viewing a video asset
  useEffect(() => {
    playerContextDispatch({
      type: "PLAYER_SET_PLAYING",
      playing: false,
    });
  }, [playerContextDispatch]);

  const padding = isMobile ? "px-3 mt-3" : "px-4 sm:px-0 mt-4";
  const titleSize = isMobile ? "sm" : "md";

  return (
    <div className="w-full">
      {/* Video Player */}
      <VideoPlayer />

      {/* Video Metadata */}
      <div className={padding}>
        <AssetMetadata
          title={assetContext.assetTitle}
          artist={assetContext.assetArtist}
          releaseTimestamp={assetContext.assetReleaseTimestamp}
          isPreview={isPreview}
          creatorDisplayName={assetContext.creatorDisplayName}
          creatorUniqueId={assetContext.creatorUniqueId}
          titleSize={titleSize}
        />
      </div>
    </div>
  );
};
