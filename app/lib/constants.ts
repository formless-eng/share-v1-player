/**
 * Shared constants for the Share application
 * Following Next.js best practices for configuration management
 */

import { base } from "viem/chains";
import { Chain } from "viem";

// ============================================================================
// BLOCKCHAIN CONSTANTS
// ============================================================================

/**
 * USDC token contract addresses by chain ID
 */
export const USDC_TOKEN_ADDRESSES: Record<number, string> = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
} as const;

/**
 * Share protocol contract address
 */
export const SHARE_PROTOCOL_ADDRESS =
  "0x3Fb4b0b61ADB6d33EE901690E2C87B413c30968b" as const;

/**
 * Chain ID mappings
 */
export const CHAIN_IDS = {
  BASE: 8453,
} as const;

/**
 * Chain name to chain ID mapping
 */
export const CHAIN_NAME_TO_ID: Record<string, number> = {
  base: CHAIN_IDS.BASE,
} as const;

/**
 * Supported blockchain chains
 */
export const SUPPORTED_CHAINS: Record<string, Chain> = {
  base: base,
} as const;

// ============================================================================
// RPC ENDPOINTS
// ============================================================================

/**
 * Alchemy RPC endpoint for Base mainnet
 * TODO: Move to environment variables for better security
 */
export const BASE_MAINNET_RPC_URL =
  "https://base-mainnet.g.alchemy.com/v2/uTDQJozcVtnDB8Rc7fvmf" as const;

// ============================================================================
// MEDIA TYPE CONSTANTS
// ============================================================================

/**
 * Supported media types
 */
export const MEDIA_TYPES = {
  AUDIO: "audio",
  VIDEO: "video",
  COLLECTION: "collection",
} as const;

export type MediaType =
  (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

// ============================================================================
// ACCESS & AUTHENTICATION CONSTANTS
// ============================================================================

/**
 * Lifetime access duration in seconds (approximately 68 years)
 */
export const LIFETIME_ACCESS_SEC = 2153088000 as const;

/**
 * Authentication message for wallet signature verification
 */
export const SERVER_AUTH_MESSAGE =
  "Signing this message verifies your wallet address and authenticates the use of Share application services." as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get network ID from chain name
 * @param chainName - The name of the blockchain (e.g., "base")
 * @returns The corresponding chain ID
 * @throws Error if chain name is not supported
 */
export function getNetworkIdFromChainName(chainName: string): number {
  const networkId = CHAIN_NAME_TO_ID[chainName];
  if (!networkId) {
    throw new Error(`Unsupported chain name: ${chainName}`);
  }
  return networkId;
}

/**
 * Get current Unix timestamp in seconds
 * @returns Current timestamp in seconds
 */
export function unixTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
