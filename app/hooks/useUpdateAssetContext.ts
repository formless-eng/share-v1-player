/**
 * Custom hook to update AssetContext with fetched data
 */

import { useEffect } from "react";
import { useAssetContextDispatch } from "@/app/contexts/AssetContext";
import { MEDIA_TYPES } from "@/app/lib/constants";
import { getAssetArtworkUri, getAssetFileUri } from "@/app/lib/utils";

export function useUpdateAssetContext(
  assetData: any,
  grantData: any,
  contractAddress: string | undefined,
  networkId: number
) {
  const dispatch = useAssetContextDispatch();

  useEffect(() => {
    if (!assetData) return;

    // Update basic asset information
    dispatch({
      type: "ASSET_LOADED",
      assetArtist: assetData.artist,
      assetArtworkUri: getAssetArtworkUri(assetData),
      assetCollection: assetData.collection,
      assetMediaType: assetData.type,
      assetTitle: assetData.title,
      assetUrl: location?.pathname,
      contractAddress: contractAddress,
      networkId: networkId,
    });

    // Update access grant information
    if (grantData) {
      dispatch({
        type: "ASSET_SET_ASSET_ACCESS_GRANT_TTL",
        accessGrantTTL: Number(grantData.grantTTL),
      });

      dispatch({
        type: "ASSET_SET_CONTRACT_GRANT_ACTIVE",
        contractGrantActive: grantData.grantActive,
      });
    }

    // Update release timestamp
    dispatch({
      type: "ASSET_SET_ASSET_RELEASE_TIMESTAMP",
      assetReleaseTimestamp: assetData.asset_release_timestamp,
    });

    // Handle access code verification (if supported)
    if (assetData.supports_access_code_verification) {
      dispatch({
        type: "ASSET_SET_ACCESS_CODE_VERIFIED",
        accessCodeVerified: assetData.access_code_verified,
      });

      if (assetData.access_code_verified) {
        dispatch({
          type: "ASSET_SET_CONTRACT_GRANT_ACTIVE",
          contractGrantActive: true,
        });
      }
    }

    // Update file URI based on media type
    const fileUri = getAssetFileUri(assetData);
    if (fileUri) {
      dispatch({
        type: "ASSET_SET_ASSET_FILE_URI",
        assetFileUri: fileUri,
      });
    }

    // Clear queue for non-collection assets
    if (assetData.type === MEDIA_TYPES.VIDEO) {
      dispatch({
        type: "ASSET_SET_ASSET_QUEUE",
        assetQueue: [],
      });
    }
  }, [assetData, grantData, contractAddress, networkId, dispatch]);
}
