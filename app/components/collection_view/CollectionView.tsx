'use client';

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { createPublicClient, formatUnits, getAddress, Hex, http } from "viem";
import pfaContractAbi from "../../abi/PFA.json";
import { CollectionItemView } from "../../components/collection_view/CollectionItemView";
import {
  useAssetContext,
  useAssetContextDispatch,
} from "../../contexts/AssetContext";
import {
  BASE_MAINNET_RPC_URL,
  SERVER_AUTH_MESSAGE,
  SUPPORTED_CHAINS,
} from "../../lib/constants";
import { makeSignedTokenURI } from "../../lib/utils";
interface IPlaylistViewProps {
  preview: boolean;
  assetList: {
    collection: string[];
  };
}

export const CollectionView: FC<IPlaylistViewProps> = ({
  preview,
  assetList = { collection: [] },
}) => {
  const assetContext = useAssetContext();
  const assetContextDispatch = useAssetContextDispatch();
  const [signature, setSignature] = useState("");
  const { client } = useSmartWallets();
  const publicClient = createPublicClient({
    chain: SUPPORTED_CHAINS.base,
    transport: http(BASE_MAINNET_RPC_URL),
  });


  useEffect(() => {
    const run = async () => {
      if (client?.account?.address && !signature) {
        setSignature(await client?.signMessage(
          { message: SERVER_AUTH_MESSAGE },
        ));
      }
    };
    run();
  }, [client?.account?.address, signature]);

  const collectionQuery = useQuery({
    queryKey: [
      "collectionQuery",
      assetList.collection,
      client?.account?.address,
      signature,
    ],
    queryFn: async () => {
      const items = await Promise.all(
        assetList.collection.map(async (element) => {
          const uri = element as string;

          // Extract contractAddress and networkId from the URI
          let contractAddress: string | undefined;
          let networkId: number | undefined;

          try {
            const url = new URL(uri);
            contractAddress =
              url.searchParams.get("contractAddress") || undefined;
            const networkIdParam = url.searchParams.get("networkId");
            networkId = networkIdParam
              ? parseInt(networkIdParam, 10)
              : undefined;
          } catch (error) {
            // If URL parsing fails, continue without contract info
          }

          const response = await fetch(
            makeSignedTokenURI({
              collectionURI: uri,
              walletAddress: client?.account?.address,
              signature: signature as string,
            })
          );
          const metadata = await response.json();

          // Attach contractAddress and networkId to the item
          return {
            ...metadata,
            contractAddress,
            networkId,
          };
        })
      );

      assetContextDispatch({
        type: "ASSET_SET_ASSET_QUEUE",
        assetQueue: items,
      });
      return items;
    },
  });

  const trackPricesQuery = useQuery({
    queryKey: [
      "collectionTrackPrices",
      collectionQuery.data?.map((item) => ({
        contractAddress: item.contractAddress,
        networkId: item.networkId || assetContext.networkId,
      })),
    ],
    enabled: collectionQuery.isSuccess,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const prices = await Promise.all(
        (collectionQuery.data || []).map(async (item) => {
          const contractAddress = item.contractAddress;
          const networkId = item.networkId || assetContext.networkId;
          const key = `${networkId}:${(
            contractAddress || ""
          ).toLowerCase()}`;

          if (!contractAddress || !networkId) {
            return [key, null] as const;
          }

          try {
            const rawPrice = await publicClient.readContract(
              {
                address: getAddress(contractAddress as Hex),
                abi: pfaContractAbi,
                functionName: "pricePerAccess",
                args: [],
              }
            );

            const rawPriceUSD = Number(
              Number(formatUnits(rawPrice as bigint, 6)).toFixed(2)
            );
            const grossPriceUSD = Number(
              (rawPriceUSD * 1.05).toFixed(2)
            );

            return [key, grossPriceUSD] as const;
          } catch {
            return [key, null] as const;
          }
        })
      );

      return Object.fromEntries(prices);
    },
  });

  return (
    <div
      className="w-full box-border"
    >

      <div className="rounded-lg shadow-lg overflow-hidden">
        {/* Album Header with Gradient */}
        <div
          className={`${isMobile ? "p-4" : "p-8"} flex flex-col md:flex-row items-center sm:items-start ${isMobile ? "" : "gap-6"}`}

        >
          {/* Album Artwork */}
          <div
          >
            {assetContext.assetArtworkUri ? (
              <img
                src={assetContext.assetArtworkUri}
                alt={assetContext.assetTitle || "Album artwork"}
                width={200}
                height={200}
              />
            ) : (
              <div
                className="w-full h-full"
              />
            )}
          </div>

          {/* Collection Info */}
          <div
            className={`flex sm:flex-col justify-between w-full ${isMobile ? "" : "md:h-56"}`}
          >
            <div>
              <p className="text-xs uppercase font-semibold text-foreground-secondary mb-2">
                {preview ? "Preview" : "Public Playlist"}
              </p>


              <div className="flex items-center gap-2 text-sm">


                {assetContext.assetArtist}

                {collectionQuery.isSuccess && (
                  <span className="text-foreground-secondary">
                    • {collectionQuery.data.length} songs
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center mt-6">

            </div>
          </div>
        </div>


        {/* Track List */}
        {collectionQuery.isSuccess && (
          <div
            className={`${isMobile ? "px-2 pb-4" : "px-4 pb-6"}`}
          >
            {/* Track List Header */}
            {!isMobile && (
              <div className={`grid ${assetContext.contractGrantActive ? "grid-cols-[auto_auto_1fr_1fr]" : "grid-cols-[auto_auto_1fr_1fr_auto]"} gap-3 px-4 py-3 border-b border-surface-accent/30 text-sm text-foreground-secondary font-medium uppercase tracking-wider`}>
                <div className="w-8 text-center">#</div>
                <div className="w-10"></div>
                <div>Title</div>
                <div>Playlist</div>
                {!assetContext.contractGrantActive && (
                  <div className="text-right">Price</div>
                )}
              </div>
            )}
            {/* Track List Items */}
            <div
              className={`${isMobile ? "" : "mt-2"} overflow-y-auto max-h-[600px] custom-scrollbar`}
            >
              {collectionQuery.data.map((item, i) => (
                // Individual track prices are fetched on-chain and cached by React Query.
                <CollectionItemView
                  key={i}
                  itemIndex={i}
                  item={item}
                  playlistName={assetContext.assetTitle || undefined}
                  trackPriceUSD={
                    trackPricesQuery.data?.[
                    `${item.networkId || assetContext.networkId
                    }:${(item.contractAddress || "").toLowerCase()}`
                    ]
                  }
                  isPurchased={assetContext.contractGrantActive === true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
