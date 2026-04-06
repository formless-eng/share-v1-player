'use client';

import { useParams } from "next/navigation";

import { AudioView } from "@/app/components/audio_view/AudioView";
import { CollectionView } from "@/app/components/collection_view/CollectionView";
import { VideoView } from "@/app/components/video_view/VideoView";
import { useAssetContext } from "@/app/contexts/AssetContext";
import { PaymentControls } from "@/app/pages/asset_page/PaymentControls";

import {
  useAssetGrant,
  useAssetMetadata,
  useAssetSignature,
} from "@/app/hooks/useAssetData";
import { useUpdateAssetContext } from "@/app/hooks/useUpdateAssetContext";
import {
  LIFETIME_ACCESS_SEC,
  MEDIA_TYPES,
  SERVER_AUTH_MESSAGE,
  getNetworkIdFromChainName,
} from "@/app/lib/constants";
import {
  isAccessPaid,
  isAssetReleased,
  isAudio,
  isCollection,
  isVideo,
  makeSignedTokenURI,
} from "@/app/lib/utils";

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================
// These exports maintain compatibility with other parts of the app
// that import from this file

export const MEDIA_TYPE_AUDIO = MEDIA_TYPES.AUDIO;
export const MEDIA_TYPE_VIDEO = MEDIA_TYPES.VIDEO;
export const MEDIA_TYPE_COLLECTION = MEDIA_TYPES.COLLECTION;
export const SHARE_LIFETIME_ACCESS_SEC = LIFETIME_ACCESS_SEC;
export const SHARE_SERVER_AUTH_MESSAGE = SERVER_AUTH_MESSAGE;

export { getNetworkIdFromChainName as getAssetNetworkIdFromChainName, makeSignedTokenURI };

// ============================================================================
// ASSET PAGE COMPONENT
// ============================================================================

export function AssetPage() {
  // Get route parameters
  const params = useParams();
  const contractAddress = params?.contractAddress as string;
  const assetChainName = params?.assetChainName as string;
  const networkId = getNetworkIdFromChainName(assetChainName);

  // Fetch data using custom hooks
  const signature = useAssetSignature();
  const assetQuery = useAssetMetadata(contractAddress, networkId, signature);
  const grantQuery = useAssetGrant(contractAddress, signature);

  // Get current asset context
  const assetContext = useAssetContext();

  // Update asset context whenever data changes
  useUpdateAssetContext(
    assetQuery.data,
    grantQuery.data,
    contractAddress,
    networkId
  );

  const handlePurchaseSuccess = () => {
    assetQuery.refetch();
    grantQuery.refetch();
  };

  const handlePurchaseFailure = (message: string) => {
    console.error("Purchase failed:", message);
  };

  const showPaymentControls =
    !isAccessPaid(assetContext.contractGrantActive) &&
    isAssetReleased(assetContext.assetReleaseTimestamp);

  console.log("showPaymentControls", showPaymentControls);

  return (
    <div className="w-full flex flex-col items-center box-border">
      {/* Render appropriate media view based on asset type */}
      {isAudio(assetContext) && <AudioView />}
      {isVideo(assetContext) && <VideoView />}
      {isCollection(assetContext) && (
        <CollectionView
          preview={!isAccessPaid(assetContext.contractGrantActive)}
          assetList={assetQuery.data}
        />
      )}
      {/* Show payment controls if user hasn't paid and asset is released */}
      {showPaymentControls ? (
        <PaymentControls
          contractAddress={contractAddress}
          networkId={networkId}
          onSuccess={handlePurchaseSuccess}
          onFailure={handlePurchaseFailure}
        />
      ) : <span className="text-xs">You have already purchased this content.</span>}
    </div>
  );
}
