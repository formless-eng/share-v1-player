/**
 * Custom hooks for fetching and managing asset data
 */

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPublicClient, erc721Abi, getAddress, Hex, http } from "viem";

import pfaAbi from "@/app/abi/PFA.json";
import {
  BASE_MAINNET_RPC_URL,
  SERVER_AUTH_MESSAGE,
  SUPPORTED_CHAINS,
  unixTimestampSeconds,
} from "@/app/lib/constants";
import { isGrantActive, makeSignedTokenURI } from "@/app/lib/utils";

const ASSET_SIGNATURE_STORAGE_KEY = "share_player_wallet_signatures";

function getSavedSignature(walletAddress: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.localStorage.getItem(ASSET_SIGNATURE_STORAGE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as Record<string, string>;
    return parsed[walletAddress.toLowerCase()] || null;
  } catch {
    return null;
  }
}

function saveSignature(walletAddress: string, signature: string): void {
  if (typeof window === "undefined") return;

  try {
    const cached = window.localStorage.getItem(ASSET_SIGNATURE_STORAGE_KEY);
    const parsed = cached ? (JSON.parse(cached) as Record<string, string>) : {};
    parsed[walletAddress.toLowerCase()] = signature;
    window.localStorage.setItem(ASSET_SIGNATURE_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore localStorage failures.
  }
}

/**
 * Hook to get wallet signature for authenticated metadata requests
 * without forcing extra wallet UIs.
 */
export function useAssetSignature() {
  const [signature, setSignature] = useState("");
  const { client } = useSmartWallets();
  const walletAddress = client?.account?.address;

  useEffect(() => {
    if (!walletAddress) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSignature("");
      return;
    }

    const saved = getSavedSignature(walletAddress);
    if (saved) {
      setSignature(saved);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress || signature) return;

    const sign = async () => {
      try {
        const nextSignature = await client?.signMessage(
          { message: SERVER_AUTH_MESSAGE },
          { uiOptions: { showWalletUIs: false } },
        );

        if (!nextSignature) return;
        setSignature(nextSignature);
        saveSignature(walletAddress, nextSignature);
      } catch (error) {
        console.error("Error signing auth message:", error);
      }
    };

    sign();
  }, [client, walletAddress, signature]);

  return signature;
}

/**
 * Hook to fetch asset metadata from the blockchain
 */
export function useAssetMetadata(
  contractAddress: string | undefined,
  networkId: number,
  signature: string,
) {
  const { client } = useSmartWallets();

  const publicClient = createPublicClient({
    chain: SUPPORTED_CHAINS.base,
    transport: http(BASE_MAINNET_RPC_URL),
  });

  return useQuery({
    queryKey: ["asset", client?.account?.address, contractAddress, networkId, signature],
    queryFn: async () => {
      if (!contractAddress) throw new Error("No contract address");

      // Get the token URI from the ERC721 contract
      const tokenURI = await publicClient.readContract({
        address: getAddress(contractAddress as Hex),
        abi: erc721Abi,
        functionName: "tokenURI",
        args: [BigInt(0)],
      });

      // Fetch the actual metadata with authentication
      const response = await fetch(
        makeSignedTokenURI({
          tokenURI: tokenURI as string,
          contractAddress: contractAddress,
          networkId: networkId,
          walletAddress: client?.account?.address,
          signature,
        }),
      );

      return await response.json();
    },
    enabled: !!contractAddress && !!signature,
  });
}

/**
 * Hook to fetch access grant information for the current user
 */
export function useAssetGrant(
  contractAddress: string | undefined,
  signature: string,
) {
  const { client } = useSmartWallets();

  const publicClient = createPublicClient({
    chain: SUPPORTED_CHAINS.base,
    transport: http(BASE_MAINNET_RPC_URL),
  });

  return useQuery({
    queryKey: ["grant", client?.account?.address, contractAddress, signature],
    queryFn: async () => {
      if (!contractAddress) throw new Error("No contract address");

      // Get the grant time-to-live (how long access lasts)
      const grantTTL = (await publicClient.readContract({
        address: getAddress(contractAddress as Hex),
        abi: pfaAbi,
        functionName: "grantTTL",
      })) as number;

      // Get when the user was granted access (if at all)
      let grantTimestamp: bigint = BigInt(0);
      if (client?.account?.address) {
        grantTimestamp = (await publicClient.readContract({
          address: getAddress(contractAddress as Hex),
          abi: pfaAbi,
          functionName: "grantTimestamp",
          args: [getAddress(client.account.address as Hex)],
        })) as bigint;
      }

      return {
        grantTTL,
        grantTimestamp,
        grantActive: isGrantActive(
          grantTTL,
          grantTimestamp,
          unixTimestampSeconds(),
        ),
      };
    },
    enabled: !!contractAddress && !!signature,
  });
}
