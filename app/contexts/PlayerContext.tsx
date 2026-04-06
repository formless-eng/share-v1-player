'use client';

import { ReactNode, createContext, useContext, useReducer } from "react";

interface IPlayerContextProps {
  playerRef: any;
  url: string | null;
  playing: boolean;
  assetArtist: string | null;
  assetTitle: string | null;
  assetArtworkUri: string | null;
  contractAddress: string | null;
  networkId: number | null;
  assetQueue: any[];
  assetQueueIndex: number;
}

const _DEFAULT_CONTEXT_STATE: IPlayerContextProps = {
  playerRef: null,
  url: null,
  playing: false,
  assetArtist: "",
  assetTitle: "",
  assetArtworkUri: null,
  contractAddress: "",
  networkId: null,
  assetQueue: [],
  assetQueueIndex: 0,
};

export const PlayerContext = createContext(_DEFAULT_CONTEXT_STATE);

/* eslint-disable-next-line */
export const PlayerDispatchContext = createContext((_: any) => { });

function playerReducer(state: any, action: any) {
  switch (action.type) {
    case "PLAYER_SET_URL":
      return {
        ...state,
        url: action.url,
      };

    case "PLAYER_SET_ASSET_METADATA":
      return {
        ...state,
        url: action.url,
        assetArtist: action.assetArtist,
        assetTitle: action.assetTitle,
        assetArtworkUri: action.assetArtworkUri,
        contractAddress: action.contractAddress,
        networkId: action.networkId,
      };

    case "PLAYER_SET_PLAYER_REF":
      return {
        ...state,
        playerRef: action.playerRef,
      };

    case "PLAYER_SET_PLAYING":
      return {
        ...state,
        playing: action.playing,
      };

    case "PLAYER_TOGGLE_PLAYING":
      return {
        ...state,
        playing: !state.playing,
      };

    case "PLAYER_SET_ASSET_QUEUE":
      return {
        ...state,
        assetQueue: action.assetQueue,
      };

    case "PLAYER_SET_ASSET_QUEUE_INDEX":
      return {
        ...state,
        assetQueueIndex: action.assetQueueIndex,
      };

    case "PLAYER_CLEAR_QUEUE":
      return {
        ...state,
        assetQueue: [],
        assetQueueIndex: 0,
      };

    default:
      return state;
  }
}

interface IPlayerContextProvider {
  children: ReactNode;
}

export const PlayerContextProvider = (
  props: IPlayerContextProvider
) => {
  const [state, dispatch] = useReducer(
    playerReducer,
    _DEFAULT_CONTEXT_STATE
  );

  return (
    <PlayerContext.Provider value={state}>
      <PlayerDispatchContext.Provider value={dispatch}>
        {props.children}
      </PlayerDispatchContext.Provider>
    </PlayerContext.Provider>
  );
};

export function usePlayerContext() {
  return useContext(PlayerContext);
}

export function usePlayerContextDispatch() {
  return useContext(PlayerDispatchContext);
}
