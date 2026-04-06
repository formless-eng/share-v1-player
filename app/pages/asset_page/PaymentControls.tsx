'use client';

import { useFundWallet, useLogin } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  getAddress,
  Hex,
  http,
} from "viem";

import shareContractAbi from "@/app/abi/SHARE.json";
import { BalanceCard } from "@/app/components/BalanceCard";
import { Button } from "@/app/components/button/Button";
import { useAssetContextDispatch } from "@/app/contexts/AssetContext";
import { BASE_MAINNET_RPC_URL, SHARE_PROTOCOL_ADDRESS, SUPPORTED_CHAINS, USDC_TOKEN_ADDRESSES } from "@/app/lib/constants";
import { formatUSDCPrice } from "@/app/lib/utils";

interface PaymentControlsProps {
  contractAddress: string;
  networkId: number;
  onSuccess: (hash: string) => void;
  onFailure: (message: string) => void;
}

export function PaymentControls({
  contractAddress,
  networkId,
  onSuccess,
  onFailure,
}: PaymentControlsProps) {
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const assetContextDispatch = useAssetContextDispatch();
  const { client } = useSmartWallets();
  const { login } = useLogin();
  const { fundWallet } = useFundWallet();

  const publicClient = createPublicClient({
    chain: SUPPORTED_CHAINS.base,
    transport: http(BASE_MAINNET_RPC_URL),
  });

  const usdcTokenAddress = USDC_TOKEN_ADDRESSES[
    networkId as keyof typeof USDC_TOKEN_ADDRESSES
  ] as Hex;

  // Fetch the price for this asset
  const priceQuery = useQuery({
    queryKey: ["price", contractAddress, SHARE_PROTOCOL_ADDRESS],
    queryFn: async () => {
      console.log(SHARE_PROTOCOL_ADDRESS);
      console.log(publicClient);
      const price = await publicClient.readContract({
        address: getAddress(SHARE_PROTOCOL_ADDRESS as Hex),
        abi: shareContractAbi,
        functionName: "grossPricePerAccess",
        args: [getAddress(contractAddress as Hex), BigInt(0)],
      });
      console.log(price);
      return price as bigint;
    },
  });

  // Fetch the user's USDC balance
  const balanceQuery = useQuery({
    queryKey: ["balance", client?.account?.address, networkId],
    queryFn: async () => {
      if (!client?.account?.address) return BigInt(0);

      const balance = await publicClient.readContract({
        address: usdcTokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [getAddress(client.account.address as Hex)],
      });
      return balance as bigint;
    },
    enabled: !!client?.account?.address,
    refetchInterval: 5000,
  });

  // Update asset context with price
  useEffect(() => {
    if (priceQuery.data) {
      assetContextDispatch({
        type: "ASSET_SET_ASSET_PRICE",
        assetPrice: priceQuery.data,
      });
    }
  }, [priceQuery.data, assetContextDispatch]);

  const handlePurchase = async () => {
    if (!client?.account?.address || !priceQuery.data) return;

    setTransactionInProgress(true);
    try {
      const hash = await client.sendTransaction({
        calls: [
          // Step 1: Approve USDC spending
          {
            to: usdcTokenAddress,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [SHARE_PROTOCOL_ADDRESS as Hex, priceQuery.data],
            }),
          },
          // Step 2: Purchase access
          {
            to: SHARE_PROTOCOL_ADDRESS as Hex,
            data: encodeFunctionData({
              abi: shareContractAbi,
              functionName: "access",
              args: [
                getAddress(contractAddress as Hex),
                BigInt(0),
                getAddress(client.account.address as Hex),
              ],
            }),
          },
        ],
      });
      onSuccess(hash as string);
    } catch (error) {
      console.error(error);
      onFailure(error instanceof Error ? error.message : "Transaction failed");
    } finally {
      setTransactionInProgress(false);
    }
  };

  const handleAddFunds = async () => {
    if (!client?.account?.address || !priceQuery.data) return;

    await fundWallet({
      address: client.account.address,
      options: {
        chain: SUPPORTED_CHAINS.base,
        amount: formatUnits(priceQuery.data, 6),
        asset: "USDC" as const,
        uiConfig: {
          receiveFundsTitle: "Transfer USDC (crypto) to your wallet",
        },
      },
    });
  };

  const hasInsufficientBalance =
    balanceQuery.data && priceQuery.data && balanceQuery.data < priceQuery.data;

  // Don't show anything if there's no price or price is free
  if (!priceQuery.data || priceQuery.data === BigInt(0)) {
    return <h1>free</h1>
  }

  // Show sign in button if user is not logged in
  if (!client?.account?.address) {
    console.log("not logged in");
    return (
      <div className="mx-auto w-full max-w-[400px]" data-cy="pay-for-access-options">
        <Button
          variant="primary"
          label="Sign In"
          onClick={login}
        />
      </div>
    );
  }

  // Show add funds button if user doesn't have enough balance
  if (hasInsufficientBalance) {
    console.log("insufficient balance");
    return (
      <div className="mx-auto w-full max-w-[400px]" data-cy="pay-for-access-options">
        <div className="flex flex-col gap-3">
          <BalanceCard balance={balanceQuery.data} price={priceQuery.data} />
          <Button
            variant="primary"
            label="Add Funds"
            onClick={handleAddFunds}
          />
        </div>
      </div>
    );
  }

  // Show purchase button
  console.log("purchase button");
  return (
    <div className="mx-auto w-full max-w-[400px]" data-cy="pay-for-access-options">
      <div className="flex flex-col gap-3">
        <BalanceCard balance={balanceQuery.data} price={priceQuery.data} />
        <Button
          variant="primary"
          label={transactionInProgress ? "Processing..." : `Buy for ${formatUSDCPrice(priceQuery.data)}`}
          onClick={handlePurchase}
        />
      </div>
    </div>
  );
}
