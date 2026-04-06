/**
 * Shared utility functions for the Share application
 * Following Next.js best practices for helper functions
 */

import { IAssetContextProps } from "@/contexts/AssetContext";
import { getAddress, Hex } from "viem";
import { LIFETIME_ACCESS_SEC, MEDIA_TYPES } from "./constants";

// ============================================================================
// URL & TOKEN URI UTILITIES
// ============================================================================

export interface MakeSignedTokenURIParams {
  collectionURI?: string;
  walletAddress?: string;
  signature?: string;
  tokenURI?: string;
  contractAddress?: string;
  networkId?: number;
}

/**
 * Creates a signed token URI with authentication parameters
 * Used for authenticated access to asset metadata
 *
 * @param params - Parameters for creating the signed URI
 * @returns URL object with authentication parameters appended
 */
export function makeSignedTokenURI({
  collectionURI,
  walletAddress,
  signature,
  tokenURI,
  contractAddress,
  networkId,
}: MakeSignedTokenURIParams): URL {
  const url = collectionURI
    ? new URL(collectionURI as string)
    : new URL(tokenURI as string);

  if (signature && !url.searchParams.has("signature")) {
    url.searchParams.append("signature", signature);
  }

  if (walletAddress && !url.searchParams.has("senderAddress")) {
    url.searchParams.append(
      "senderAddress",
      getAddress(walletAddress as Hex)
    );
  }

  if (contractAddress && !url.searchParams.has("contractAddress")) {
    url.searchParams.append("contractAddress", contractAddress);
  }

  if (networkId && !url.searchParams.has("networkId")) {
    url.searchParams.append("networkId", networkId.toString());
  }

  return new URL(url.toString());
}

// ============================================================================
// ASSET TYPE CHECKING UTILITIES
// ============================================================================

/**
 * Check if the asset is an audio file
 */
export function isAudio(context: IAssetContextProps): boolean {
  return context.assetMediaType === MEDIA_TYPES.AUDIO;
}

/**
 * Check if the asset is a video file
 */
export function isVideo(context: IAssetContextProps): boolean {
  return context.assetMediaType === MEDIA_TYPES.VIDEO;
}

/**
 * Check if the asset is a collection (playlist/album)
 */
export function isCollection(context: IAssetContextProps): boolean {
  return context.assetMediaType === MEDIA_TYPES.COLLECTION;
}

/**
 * Check if access to the asset has been paid for
 */
export function isAccessPaid(
  contractGrantActive: boolean | undefined
): boolean {
  return contractGrantActive === true;
}

/**
 * Determine if an asset is downloadable based on ownership and access rights
 *
 * @param assetMediaType - Type of media (audio, video, collection)
 * @param assetPrice - Price of the asset
 * @param verifiedNFTOwner - Whether the user owns the NFT
 * @param accessGrantTTL - Time-to-live for access grant
 * @param contractGrantActive - Whether the access grant is currently active
 * @returns true if the asset can be downloaded
 */
export function isDownloadable(
  assetMediaType: string,
  assetPrice: number,
  verifiedNFTOwner: boolean,
  accessGrantTTL: number,
  contractGrantActive: boolean
): boolean {
  const isValidMediaType =
    assetMediaType === MEDIA_TYPES.AUDIO ||
    assetMediaType === MEDIA_TYPES.VIDEO ||
    assetMediaType === MEDIA_TYPES.COLLECTION;

  const hasAccessRights =
    (assetPrice === 0 && verifiedNFTOwner) ||
    (assetPrice !== 0 &&
      accessGrantTTL !== LIFETIME_ACCESS_SEC &&
      contractGrantActive);

  return isValidMediaType && hasAccessRights;
}

// ============================================================================
// ASSET METADATA UTILITIES
// ============================================================================

/**
 * Extract artwork URI from asset data
 * Handles different property names (image vs artwork)
 *
 * @param assetData - Asset metadata object
 * @returns The artwork URI or undefined
 */
export function getAssetArtworkUri(
  assetData: any
): string | undefined {
  return assetData?.image || assetData?.artwork;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format a USDC amount (6 decimals) as a USD price string
 *
 * @param price - The price in USDC base units (bigint with 6 decimals)
 * @returns Formatted price string like "$1.23" or "$0.00"
 */
export function formatUSDCPrice(price: bigint | undefined): string {
  if (!price) return "$0.00";

  // USDC uses 6 decimals
  const dollars = Number(price) / 1_000_000;
  return `$${dollars.toFixed(2)}`;
}

// ============================================================================
// ASSET ACCESS & GRANT UTILITIES
// ============================================================================

/**
 * Calculate whether an access grant is currently active
 *
 * @param grantTTL - Time-to-live for the grant in seconds
 * @param grantTimestamp - When the grant was issued (unix timestamp)
 * @param currentTime - Current time in seconds (defaults to now)
 * @returns true if the grant is active
 */
export function isGrantActive(
  grantTTL: number,
  grantTimestamp: bigint,
  currentTime?: number
): boolean {
  const now = currentTime ?? Math.round(Date.now() / 1000);
  const timeElapsed = Math.abs(now - Number(grantTimestamp));
  return (
    grantTTL > 0 &&
    timeElapsed < grantTTL &&
    Number(grantTimestamp) !== 0
  );
}

/**
 * Get the appropriate file URI for an asset based on its type
 *
 * @param assetData - The asset metadata from the API
 * @returns The file URI to use for playback
 */
export function getAssetFileUri(assetData: any): string | undefined {
  const mediaType = assetData?.type;

  switch (mediaType) {
    case MEDIA_TYPES.VIDEO:
      // Prefer HLS streaming for video
      return assetData?.video_hls || assetData?.video;

    case MEDIA_TYPES.AUDIO:
      return assetData?.audio;

    case MEDIA_TYPES.COLLECTION:
      return assetData?.audio;

    default:
      return undefined;
  }
}

/**
 * Check if the asset release date has passed
 *
 * @param releaseTimestamp - Unix timestamp of the release date
 * @returns true if the asset has been released
 */
export function isAssetReleased(
  releaseTimestamp: number | null
): boolean {
  if (releaseTimestamp === null || releaseTimestamp === undefined)
    return true;
  return releaseTimestamp * 1000 - Date.now() < 0;
}
