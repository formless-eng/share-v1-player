/**
 * Custom hook for handling autoplay behavior
 * Works around browser autoplay restrictions
 */

import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";

interface AutoplayOptions {
  shouldAutoplay: boolean;
  playerRef?: any;
  onPlay?: () => void;
}

export function useAutoplay({ shouldAutoplay, playerRef, onPlay }: AutoplayOptions) {
  const hasAttemptedAutoplay = useRef(false);

  useEffect(() => {
    // Only attempt autoplay once
    if (!shouldAutoplay || hasAttemptedAutoplay.current) {
      return;
    }

    hasAttemptedAutoplay.current = true;

    const attemptAutoplay = async () => {
      if (isMobile && playerRef?.current) {
        // On mobile, directly access the HTML element
        const mediaElement = playerRef.current?.player?.player?.player;
        if (mediaElement) {
          try {
            await mediaElement.load();
            await mediaElement.play();
          } catch (error) {
            console.warn("Autoplay blocked:", error);
          }
        }
      } else if (onPlay) {
        // On desktop, use the callback
        onPlay();
      }
    };

    attemptAutoplay();
  }, [shouldAutoplay, playerRef, onPlay]);
}
