/**
 * Audio View Component
 * Displays audio assets with artwork, metadata, and playback controls
 * Refactored for clarity and simplicity
 */

'use client';

import { FC, useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

import { useAssetContext } from "../../contexts/AssetContext";
import { usePlayerContext } from "../../contexts/PlayerContext";
import { useAutoplay } from "../../hooks/useAutoplay";
import { usePlayerControls } from "../../hooks/usePlayerControls";
import { Button } from "../button/Button";
import { AssetMetadata } from "../shared/AssetMetadata";

export const AudioView: FC = () => {
  // Get asset and player state
  const assetContext = useAssetContext();
  const playerContext = usePlayerContext();
  const { playSingleTrack, playFromQueue, pause } = usePlayerControls();

  // Track if this asset is currently playing
  const [isPlaying, setIsPlaying] = useState(false);

  // Determine if this is a preview (user hasn't paid)
  const isPreview = !assetContext.contractGrantActive && Number(assetContext.assetPrice) !== 0;

  // Sync local playing state with global player state
  useEffect(() => {
    const run = async () => {
      const isThisAssetPlaying =
        assetContext.contractAddress === playerContext.contractAddress &&
        playerContext.playing;
      setIsPlaying(isThisAssetPlaying);
    }
    run();
  }, [
    assetContext.contractAddress,
    playerContext.contractAddress,
    playerContext.playing,
  ]);

  // Play button click handler
  const handlePlay = useCallback(() => {
    const isAudio = assetContext.assetMediaType === "audio";
    const isCollection = assetContext.assetMediaType === "collection";

    if (isAudio) {
      // Play single audio track
      playSingleTrack({
        url: assetContext.assetFileUri,
        artist: assetContext.assetArtist,
        title: assetContext.assetTitle,
        artworkUri: assetContext.assetArtworkUri,
        contractAddress: assetContext.contractAddress,
        networkId: assetContext.networkId,
      });
    } else if (isCollection && assetContext.assetQueue.length > 0) {
      // Play from collection/playlist
      const queueIndex = playerContext.assetQueueIndex || 0;
      playFromQueue(
        assetContext.assetQueue,
        queueIndex,
        assetContext.contractAddress,
        assetContext.networkId
      );
    }
  }, [
    assetContext.assetMediaType,
    assetContext.assetFileUri,
    assetContext.assetArtist,
    assetContext.assetTitle,
    assetContext.assetArtworkUri,
    assetContext.contractAddress,
    assetContext.networkId,
    assetContext.assetQueue,
    playerContext.assetQueueIndex,
    playSingleTrack,
    playFromQueue,
  ]);

  // Handle autoplay if requested
  useAutoplay({
    shouldAutoplay: assetContext.autoPlay,
    playerRef: playerContext.playerRef,
    onPlay: handlePlay,
  });

  const padding = isMobile ? "px-4" : "px-6";

  return (
    <div className={`w-full max-w-3xl mx-auto ${padding}`}>
      <div className={`${isMobile ? "" : "mt-6"} rounded-lg overflow-hidden`}>
        <div className={`${isMobile ? "p-6" : "p-8"} flex flex-col md:flex-row ${isMobile ? "" : "gap-6"}`}>
          {/* Album Artwork */}
          <div>
            <img
              src={assetContext.assetArtworkUri || ""}
              alt={assetContext.assetTitle || "Album artwork"}
              height={200}
              width={200}
            />
          </div>
          {/* Metadata and Controls */}
          <div className="flex sm:flex-col justify-between flex-grow">
            <AssetMetadata
              title={assetContext.assetTitle}
              artist={assetContext.assetArtist}
              releaseTimestamp={assetContext.assetReleaseTimestamp}
              isPreview={isPreview}
              creatorDisplayName={assetContext.creatorDisplayName}
              creatorUniqueId={assetContext.creatorUniqueId}
              titleSize={isMobile ? "sm" : "lg"}
            />

            {/* Play/Pause Button */}
            <div className="flex items-center">
              <Button variant="primary" onClick={
                () => {
                  if (isPlaying) {
                    pause();
                  } else {
                    handlePlay();
                  }
                }
              } label={isPlaying ? "Pause" : "Play"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
