import { BASE_URL } from "@/app/constants/api";
import { generateReactHelpers } from "@uploadthing/react";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers({
    url: BASE_URL
  });

/**
 * UploadThing reports `totalProgress` as a 0-1 fraction even though its own types
 * describe it as a percentage — its React hook sidesteps the field entirely and
 * averages the per-file `progress` values, which really are percentages. Every
 * progress bar in this app works in percent, so normalise at the boundary.
 */
export function totalProgressToPercent(totalProgress: number): number {
  return Math.max(0, Math.min(100, totalProgress * 100));
}
