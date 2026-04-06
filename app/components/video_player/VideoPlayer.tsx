/**
 * Video Player Component
 * Handles video playback using react-player
 * Supports HLS streaming
 */

'use client';

import { FC, lazy, Suspense, useRef } from "react";
import { useAssetContext } from "@/app/contexts/AssetContext";
import { useAutoplay } from "@/app/hooks/useAutoplay";

const ReactPlayer = lazy(() => import("react-player"));

// HLS quality configuration
// See: https://github.com/video-dev/hls.js/blob/master/docs/API.md#hlsstartlevel
const HLS_MAX_START_LEVEL = 100;

export const VideoPlayer: FC = () => {
  const assetContext = useAssetContext();
  const videoPlayerRef = useRef<any>(null);

  // Handle autoplay if requested
  useAutoplay({
    shouldAutoplay: assetContext.autoPlay,
    playerRef: videoPlayerRef,
  });

  // Callback for when video starts playing
  const handleOnStart = () => {
    // Track play event if needed
    // Currently a no-op but hook is here for future analytics
  };

  return (
    <div
      className="w-full overflow-hidden bg-black"
      style={{ aspectRatio: "16 / 9" }}
    >
      <Suspense fallback={<div style={{ display: "none" }} />}>
        <ReactPlayer
          ref={videoPlayerRef}
          src={assetContext.assetFileUri as string}
          playing={true}
          controls={true}
          playsInline={true}
          volume={1}
          muted={true}
          loop={true}
          width="100%"
          height="100%"
          onStart={handleOnStart}
          config={{
            hls: {
              startLevel: HLS_MAX_START_LEVEL,
            },
          }}
        />
      </Suspense>
    </div>
  );
};
