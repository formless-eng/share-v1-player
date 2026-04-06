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

export function PaymentControls({ contractAddress, networkId, onSuccess, onFailure }: PaymentControlsProps) {
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const assetContextDispatch = useAssetContextDispatch();
  const { client } = useSmartWallets();
  const { login } = useLogin();
  const { fundWallet } = useFundWallet();

  const publicClient = createPublicClient({
    chain: SUPPORTED_CHAINS.base,
    transport: http(BASE_MAINNET_RPC_URL),
  });

  const usdcTokenAddress = USDC_TOKEN_ADDRESSES[networkId as keyof typeof USDC_TOKEN_ADDRESSES] as Hex;

  const priceQuery = useQuery({
    queryKey: ["price", contractAddress, SHARE_PROTOCOL_ADDRESS],
    queryFn: async () => {
      const price = await publicClient.readContract({
        address: getAddress(SHARE_PROTOCOL_ADDRESS as Hex),
        abi: shareContractAbi,
        functionName: "grossPricePerAccess",
        args: [getAddress(contractAddress as Hex), BigInt(0)],
      });
      return price as bigint;
    },
  });

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

  useEffect(() => {
    if (priceQuery.data) {
      assetContextDispatch({ type: "ASSET_SET_ASSET_PRICE", assetPrice: priceQuery.data });
    }
  }, [priceQuery.data, assetContextDispatch]);

  const handlePurchase = async () => {
    if (!client?.account?.address || !priceQuery.data) return;

    setTransactionInProgress(true);
    try {
      const hash = await client.sendTransaction({
        calls: [
          {
            to: usdcTokenAddress,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [SHARE_PROTOCOL_ADDRESS as Hex, priceQuery.data],
            }),
          },
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
        uiConfig: { receiveFundsTitle: "Transfer USDC (crypto) to your wallet" },
      },
    });
  };

  const hasInsufficientBalance = balanceQuery.data && priceQuery.data && balanceQuery.data < priceQuery.data;

  if (!priceQuery.data || priceQuery.data === BigInt(0)) {
    return <p className="text-sm text-zinc-600">This item is free.</p>;
  }

  if (!client?.account?.address) {
    return (
      <div className="mx-auto w-full max-w-[400px]" data-cy="pay-for-access-options">
        <Button variant="primary" label="Sign in to continue" onClick={login} />
      </div>
    );
  }

  if (hasInsufficientBalance) {
    return (
      <div className="mx-auto w-full max-w-[400px]" data-cy="pay-for-access-options">
        <div className="flex flex-col gap-3">
          <BalanceCard balance={balanceQuery.data} price={priceQuery.data} />
          <Button variant="primary" label={`Add funds (${formatUSDCPrice(priceQuery.data)})`} onClick={handleAddFunds} />
        </div>
      </div>
    );
  }

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
