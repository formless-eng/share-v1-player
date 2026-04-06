/**
 * Reusable component for displaying asset metadata
 * Shows title, artist, release year, and preview badge
 */

'use client';

import { FC } from "react";

interface AssetMetadataProps {
  title: string | null;
  artist: string | null;
  releaseTimestamp: number | null;
  isPreview?: boolean;
  creatorDisplayName?: string | null;
  creatorUniqueId?: string | null;
  creatorVerified?: boolean;
  titleSize?: "sm" | "md" | "lg";
  className?: string;
}

export const AssetMetadata: FC<AssetMetadataProps> = ({
  title,
  artist,
  isPreview = false,
  titleSize = "lg",
  className = "",
}) => {
  const titleSizeClass = {
    sm: "text-xl",
    md: "text-[22px]",
    lg: "text-3xl",
  }[titleSize];

  return (
    <div className={className}>
      <h1 className={`${titleSizeClass} font-bold my-1`}>
        {title || "UNTITLED"}
      </h1>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span
            className={`text-foreground-primary font-semibold text-xs`}>{artist || "ARTIST"}</span></div>
      </div>
      {isPreview && (
        <>
          <span className="text-gray-400">PREVIEW</span>
        </>
      )}
    </div>
  );
};
