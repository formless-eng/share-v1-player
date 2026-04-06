'use client';

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { FC, useEffect, useState } from "react";
import { createPublicClient, formatUnits, getAddress, Hex, http } from "viem";

import pfaContractAbi from "@/app/abi/PFA.json";
import { CollectionItemView } from "@/app/components/collection_view/CollectionItemView";
import { useAssetContext, useAssetContextDispatch } from "@/app/contexts/AssetContext";
import { BASE_MAINNET_RPC_URL, SERVER_AUTH_MESSAGE, SUPPORTED_CHAINS } from "@/app/lib/constants";
import { makeSignedTokenURI } from "@/app/lib/utils";

interface IPlaylistViewProps {
  preview: boolean;
  assetList: {
    collection: string[];
  };
}

export const CollectionView: FC<IPlaylistViewProps> = ({ preview, assetList = { collection: [] } }) => {
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
        setSignature(await client.signMessage({ message: SERVER_AUTH_MESSAGE }));
      }
    };
    run();
  }, [client, signature]);

  const collectionQuery = useQuery({
    queryKey: ["collectionQuery", assetList.collection, client?.account?.address, signature],
    queryFn: async () => {
      const items = await Promise.all(
        assetList.collection.map(async (uri) => {
          let contractAddress: string | undefined;
          let networkId: number | undefined;

          try {
            const url = new URL(uri);
            contractAddress = url.searchParams.get("contractAddress") || undefined;
            const networkIdParam = url.searchParams.get("networkId");
            networkId = networkIdParam ? parseInt(networkIdParam, 10) : undefined;
          } catch {
            // Ignore invalid item URLs.
          }

          const response = await fetch(
            makeSignedTokenURI({
              collectionURI: uri,
              walletAddress: client?.account?.address,
              signature,
            }),
          );
          const metadata = await response.json();

          return {
            ...metadata,
            contractAddress,
            networkId,
          };
        }),
      );

      assetContextDispatch({ type: "ASSET_SET_ASSET_QUEUE", assetQueue: items });
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
          const key = `${networkId}:${(contractAddress || "").toLowerCase()}`;

          if (!contractAddress || !networkId) return [key, null] as const;

          try {
            const rawPrice = await publicClient.readContract({
              address: getAddress(contractAddress as Hex),
              abi: pfaContractAbi,
              functionName: "pricePerAccess",
              args: [],
            });

            const rawPriceUSD = Number(Number(formatUnits(rawPrice as bigint, 6)).toFixed(2));
            return [key, Number((rawPriceUSD * 1.05).toFixed(2))] as const;
          } catch {
            return [key, null] as const;
          }
        }),
      );

      return Object.fromEntries(prices);
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row">
          {assetContext.assetArtworkUri ? (
            <img
              src={assetContext.assetArtworkUri}
              alt={assetContext.assetTitle || "Album artwork"}
              width={160}
              height={160}
              className="aspect-square w-full max-w-[160px] rounded-2xl border border-zinc-200 object-cover"
            />
          ) : null}
          <div className="flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{preview ? "Preview" : "Playlist"}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">{assetContext.assetTitle || "Untitled"}</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {assetContext.assetArtist}
              {collectionQuery.isSuccess ? ` • ${collectionQuery.data.length} songs` : ""}
            </p>
          </div>
        </div>

        {collectionQuery.isSuccess && (
          <div className="space-y-1">
            {collectionQuery.data.map((item, i) => (
              <CollectionItemView
                key={i}
                itemIndex={i}
                item={item}
                playlistName={assetContext.assetTitle || undefined}
                trackPriceUSD={
                  trackPricesQuery.data?.[
                    `${item.networkId || assetContext.networkId}:${(item.contractAddress || "").toLowerCase()}`
                  ]
                }
                isPurchased={assetContext.contractGrantActive === true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
