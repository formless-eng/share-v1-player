/**
 * Custom hook for managing audio player controls
 * Consolidates all player interaction logic in one place
 */

import { useCallback } from "react";
import {
  usePlayerContext,
  usePlayerContextDispatch,
} from "@/app/contexts/PlayerContext";

interface PlayerMetadata {
  url: string | null;
  artist: string | null;
  title: string | null;
  artworkUri: string | null;
  contractAddress: string | null;
  networkId: number | null;
}

interface QueueItem {
  audio: string;
  artist: string;
  name: string;
  image: string;
}

export function usePlayerControls() {
  const playerContext = usePlayerContext();
  const dispatch = usePlayerContextDispatch();

  // Play a single audio track (not part of a collection)
  const playSingleTrack = useCallback(
    (metadata: PlayerMetadata) => {
      dispatch({ type: "PLAYER_CLEAR_QUEUE" });
      dispatch({
        type: "PLAYER_SET_ASSET_METADATA",
        url: metadata.url,
        assetArtist: metadata.artist,
        assetTitle: metadata.title,
        assetArtworkUri: metadata.artworkUri,
        contractAddress: metadata.contractAddress,
        networkId: metadata.networkId,
      });
      dispatch({ type: "PLAYER_SET_PLAYING", playing: true });
    },
    [dispatch],
  );

  // Play a track from a collection/playlist
  const playFromQueue = useCallback(
    (
      queue: QueueItem[],
      index: number,
      contractAddress: string | null,
      networkId: number | null,
    ) => {
      const track = queue[index];
      if (!track) return;

      dispatch({ type: "PLAYER_SET_ASSET_QUEUE", assetQueue: queue });
      dispatch({
        type: "PLAYER_SET_ASSET_QUEUE_INDEX",
        assetQueueIndex: index,
      });
      dispatch({
        type: "PLAYER_SET_ASSET_METADATA",
        url: track.audio,
        assetArtist: track.artist,
        assetTitle: track.name,
        assetArtworkUri: track.image,
        contractAddress,
        networkId,
      });
      console.log("playing", playerContext.playing);
      dispatch({ type: "PLAYER_SET_PLAYING", playing: true });
    },
    [dispatch],
  );

  // Pause playback
  const pause = useCallback(() => {
    dispatch({ type: "PLAYER_SET_PLAYING", playing: false });
  }, [dispatch]);

  // Resume playback
  const play = useCallback(() => {
    dispatch({ type: "PLAYER_SET_PLAYING", playing: true });
  }, [dispatch]);

  return {
    playSingleTrack,
    playFromQueue,
    pause,
    play,
  };
}
