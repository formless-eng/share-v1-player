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
    md: "text-2xl",
    lg: "text-3xl",
  }[titleSize];

  return (
    <div className={className}>
      <h1 className={`${titleSizeClass} font-semibold tracking-tight text-zinc-950`}>
        {title || "Untitled"}
      </h1>
      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-600">
        <span className="font-medium text-zinc-700">{artist || "Unknown artist"}</span>
        {isPreview && <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500">Preview</span>}
      </div>
    </div>
  );
};
