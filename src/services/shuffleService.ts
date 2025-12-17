import type { PhotoAsset } from "../types/photo";

/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array in-place with O(n) complexity
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Manages photo session state to prevent duplicates
 */
export class PhotoSessionManager {
  private shuffledPhotos: PhotoAsset[] = [];
  private currentIndex = 0;

  /**
   * Initialize with all available photos (shuffles them)
   */
  initialize(photos: PhotoAsset[]): void {
    this.shuffledPhotos = shuffle(photos);
    this.currentIndex = 0;
  }

  /**
   * Reset the session (re-shuffles, called on pull-to-refresh)
   */
  reset(): void {
    this.shuffledPhotos = shuffle(this.shuffledPhotos);
    this.currentIndex = 0;
  }

  /**
   * Get the next batch of photos
   */
  getNextBatch(count: number): PhotoAsset[] {
    const batch = this.shuffledPhotos.slice(
      this.currentIndex,
      this.currentIndex + count
    );
    this.currentIndex += batch.length;
    return batch;
  }

  /**
   * Check if there are more photos available
   */
  hasMore(): boolean {
    return this.currentIndex < this.shuffledPhotos.length;
  }

  /**
   * Get total number of available photos
   */
  getTotalCount(): number {
    return this.shuffledPhotos.length;
  }

  /**
   * Get number of photos already shown
   */
  getShownCount(): number {
    return this.currentIndex;
  }
}
