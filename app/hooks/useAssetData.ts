/**
 * Custom hooks for fetching and managing asset data
 */

import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPublicClient, erc721Abi, getAddress, Hex, http } from "viem";

import pfaAbi from "../abi/PFA.json";
import {
  BASE_MAINNET_RPC_URL,
  SERVER_AUTH_MESSAGE,
  SUPPORTED_CHAINS,
  unixTimestampSeconds,
} from "../lib/constants";
import { isGrantActive, makeSignedTokenURI } from "../lib/utils";

/**
 * Hook to get wallet signature for authenticated requests
 */
export function useAssetSignature() {
  const [signature, setSignature] = useState("");
  const { client } = useSmartWallets();

  useEffect(() => {
    const getSignature = async () => {
      if (client?.account?.address && !signature) {
        const sig = await client.signMessage({ message: SERVER_AUTH_MESSAGE });
        setSignature(sig);
      }
    };
    getSignature();
  }, [client?.account?.address, signature]);

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
    queryKey: ["asset", client?.account?.address, contractAddress, signature],
    queryFn: async () => {
      if (!contractAddress) throw new Error("No contract address");

      // Get the token URI from the NFT contract
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
          signature: signature,
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
