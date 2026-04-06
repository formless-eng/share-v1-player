'use client';

import { ReactNode, createContext, useContext, useReducer } from "react";

export interface IAssetContextProps {
  contractAddress: string | null;
  networkId: number | null;
  assetQueue: any[];
  assetArtist: string | null;
  assetTitle: string | null;
  assetArtworkUri: string | null;
  assetMediaType: string | null;
  assetCollection: any[];
  autoPlay: boolean;
  contractGrantActive: boolean;
  contractGrantTimeLeft: number | null;
  assetPrice: number | null;
  accessGrantTTL: number | null;
  assetFileUri: string | null;
  verifiedNFTOwner: boolean;
  grantTimeList: any[];
  assetReleaseTimestamp: number | null;
  creatorUniqueId: string | null;
  creatorDisplayName: string | null;
}

const _DEFAULT_CONTEXT_STATE: IAssetContextProps = {
  contractAddress: "",
  networkId: 137,
  assetFileUri: "",
  assetQueue: [],
  assetArtist: "",
  assetTitle: "",
  assetArtworkUri: null,
  assetMediaType: "",
  assetCollection: [],
  autoPlay: false,
  contractGrantActive: false,
  contractGrantTimeLeft: null,
  assetPrice: null,
  accessGrantTTL: null,
  verifiedNFTOwner: false,
  grantTimeList: [],
  assetReleaseTimestamp: null,
  creatorUniqueId: null,
  creatorDisplayName: null,
};

export const AssetContext = createContext(_DEFAULT_CONTEXT_STATE);

// eslint-disable-next-line no-unused-vars
export const AssetDispatchContext = createContext((_: any) => { });

function assetContextReducer(state: any, action: any) {
  switch (action.type) {
    case "ASSET_LOADED":
      return {
        ...state,
        assetArtist: action.assetArtist,
        assetArtworkUri: action.assetArtworkUri,
        assetCollection: action.assetCollection,
        assetMediaType: action.assetMediaType,
        assetTitle: action.assetTitle,
        contractAddress: action.contractAddress,
        networkId: action.networkId,
      };

    case "ASSET_SET_ASSET_FILE_URI":
      return {
        ...state,
        assetFileUri: action.assetFileUri,
      };

    case "ASSET_SET_ASSET_QUEUE":
      return {
        ...state,
        assetQueue: action.assetQueue,
      };

    case "ASSET_SET_AUTO_PLAY":
      return {
        ...state,
        autoPlay: action.autoPlay,
      };

    case "ASSET_SET_CONTRACT_GRANT_ACTIVE":
      return {
        ...state,
        contractGrantActive: action.contractGrantActive,
      };

    case "ASSET_SET_CONTRACT_GRANT_TIME_LEFT":
      return {
        ...state,
        contractGrantTimeLeft: action.contractGrantTimeLeft,
      };

    case "ASSET_SET_ASSET_PRICE":
      return {
        ...state,
        assetPrice: action.assetPrice,
      };

    case "ASSET_SET_ASSET_ACCESS_GRANT_TTL":
      return {
        ...state,
        accessGrantTTL: action.accessGrantTTL,
      };

    case "ASSET_SET_NFT_VERIFICATION":
      return {
        ...state,
        verifiedNFTOwner: action.verifiedNFTOwner,
      };

    case "ASSET_SET_GRANT_TIME_LIST":
      return {
        ...state,
        grantTimeList: action.grantTimeList,
      };

    case "ASSET_SET_ASSET_RELEASE_TIMESTAMP":
      return {
        ...state,
        assetReleaseTimestamp: action.assetReleaseTimestamp,
      };

    case "ASSET_SET_CREATOR_UNIQUE_ID":
      return {
        ...state,
        creatorUniqueId: action.creatorUniqueId,
      };

    case "ASSET_SET_CREATOR_DISPLAY_NAME":
      return {
        ...state,
        creatorDisplayName: action.creatorDisplayName,
      };

    case "ASSET_CLEAR_CONTEXT":
      return {
        ...state,
        ..._DEFAULT_CONTEXT_STATE,
      };

    default:
      return state;
  }
}

export const AssetContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    assetContextReducer,
    _DEFAULT_CONTEXT_STATE
  );

  return (
    <AssetContext.Provider value={state}>
      <AssetDispatchContext.Provider value={dispatch}>
        {children}
      </AssetDispatchContext.Provider>
    </AssetContext.Provider>
  );
};

export function useAssetContext() {
  return useContext(AssetContext);
}

export function useAssetContextDispatch() {
  return useContext(AssetDispatchContext);
}
