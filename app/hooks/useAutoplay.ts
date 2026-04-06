import { useEffect, useRef } from "react";

interface AutoplayOptions {
  shouldAutoplay: boolean;
  playerRef?: {
    current?: {
      player?: { player?: { player?: HTMLMediaElement } };
    };
  } | null;
  onPlay?: () => void;
}

export function useAutoplay({ shouldAutoplay, playerRef, onPlay }: AutoplayOptions) {
  const hasAttemptedAutoplay = useRef(false);

  useEffect(() => {
    if (!shouldAutoplay || hasAttemptedAutoplay.current) {
      return;
    }

    hasAttemptedAutoplay.current = true;

    const mediaElement = playerRef?.current?.player?.player?.player;
    if (mediaElement) {
      mediaElement
        .play()
        .catch(() => {
          if (onPlay) onPlay();
        });
      return;
    }

    if (onPlay) onPlay();
  }, [onPlay, playerRef, shouldAutoplay]);
}
