'use client';

import { useParams } from "next/navigation";

import { AudioView } from "@/app/components/audio_view/AudioView";
import { CollectionView } from "@/app/components/collection_view/CollectionView";
import { VideoView } from "@/app/components/video_view/VideoView";
import { useAssetContext } from "@/app/contexts/AssetContext";
import { useAssetGrant, useAssetMetadata, useAssetSignature } from "@/app/hooks/useAssetData";
import { useUpdateAssetContext } from "@/app/hooks/useUpdateAssetContext";
import { getNetworkIdFromChainName } from "@/app/lib/constants";
import { isAccessPaid, isAssetReleased, isAudio, isCollection, isVideo } from "@/app/lib/utils";
import { PaymentControls } from "@/app/pages/asset_page/PaymentControls";

export function AssetPage() {
  const params = useParams();
  const contractAddress = params?.contractAddress as string;
  const assetChainName = params?.assetChainName as string;
  const networkId = getNetworkIdFromChainName(assetChainName);

  const signature = useAssetSignature();
  const assetQuery = useAssetMetadata(contractAddress, networkId, signature);
  const grantQuery = useAssetGrant(contractAddress, signature);
  const assetContext = useAssetContext();

  useUpdateAssetContext(assetQuery.data, grantQuery.data, contractAddress, networkId);

  const showPaymentControls =
    !isAccessPaid(assetContext.contractGrantActive) && isAssetReleased(assetContext.assetReleaseTimestamp);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-10">
      {isAudio(assetContext) && <AudioView />}
      {isVideo(assetContext) && <VideoView />}
      {isCollection(assetContext) && (
        <CollectionView
          preview={!isAccessPaid(assetContext.contractGrantActive)}
          assetList={assetQuery.data}
        />
      )}

      {showPaymentControls ? (
        <PaymentControls
          contractAddress={contractAddress}
          networkId={networkId}
          onSuccess={() => {
            assetQuery.refetch();
            grantQuery.refetch();
          }}
          onFailure={(message: string) => {
            console.error("Purchase failed:", message);
          }}
        />
      ) : (
        <p className="text-center text-sm text-zinc-600">You've purchased this item.</p>
      )}
    </main>
  );
}
