'use client';

import { useEffect, useRef } from "react";
import { usePlayerContext, usePlayerContextDispatch } from "@/app/contexts/PlayerContext";

export const Player = () => {
  const playerContext = usePlayerContext();
  const playerContextDispatch = usePlayerContextDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Set player ref in context
  useEffect(() => {
    if (audioRef.current) {
      playerContextDispatch({
        type: "PLAYER_SET_PLAYER_REF",
        playerRef: { current: { player: { player: { player: audioRef.current } } } },
      });
    }
  }, []);

  // Handle URL changes
  useEffect(() => {
    if (audioRef.current && playerContext.url) {
      audioRef.current.src = playerContext.url;
      audioRef.current.load();
    }
  }, [playerContext.url]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (playerContext.playing) {
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [playerContext.playing, playerContext.url]);

  // Handle ended
  const handleEnded = () => {
    // If a playlist is being played, play next song
    if (playerContext.assetQueue.length > 0) {
      if (playerContext.assetQueueIndex < playerContext.assetQueue.length - 1) {
        playerContextDispatch({
          type: "PLAYER_SET_ASSET_QUEUE_INDEX",
          assetQueueIndex: playerContext.assetQueueIndex + 1,
        });
        playerContextDispatch({
          type: "PLAYER_SET_ASSET_METADATA",
          url: playerContext.assetQueue[playerContext.assetQueueIndex + 1].audio,
          assetArtist: playerContext.assetQueue[playerContext.assetQueueIndex + 1].artist,
          assetTitle: playerContext.assetQueue[playerContext.assetQueueIndex + 1].name,
          assetArtworkUri: playerContext.assetQueue[playerContext.assetQueueIndex + 1].image,
          contractAddress: playerContext.contractAddress,
          networkId: playerContext.networkId,
        });
        playerContextDispatch({
          type: "PLAYER_SET_PLAYING",
          playing: true,
        });
      } else {
        playerContextDispatch({
          type: "PLAYER_SET_PLAYING",
          playing: false,
        });
      }
    } else {
      playerContextDispatch({
        type: "PLAYER_SET_PLAYING",
        playing: false,
      });
    }
  };


  return (
    <audio
      ref={audioRef}
      onEnded={handleEnded}
      style={{ display: 'none' }}
    />
  );
};
