/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array in-place with O(n) complexity
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Manages photo session state to prevent duplicates
 */
export class PhotoSessionManager {
  private shownPhotoIds: Set<string> = new Set();
  private shuffledIds: string[] = [];
  private currentIndex: number = 0;

  /**
   * Initialize with all available photo IDs
   */
  initialize(photoIds: string[]): void {
    this.shuffledIds = shuffle(photoIds);
    this.currentIndex = 0;
    this.shownPhotoIds.clear();
  }

  /**
   * Reset the session (called on pull-to-refresh)
   */
  reset(): void {
    this.shuffledIds = shuffle(this.shuffledIds);
    this.currentIndex = 0;
    this.shownPhotoIds.clear();
  }

  /**
   * Get the next batch of photo IDs
   */
  getNextBatch(count: number): string[] {
    const batch: string[] = [];

    while (batch.length < count && this.currentIndex < this.shuffledIds.length) {
      const id = this.shuffledIds[this.currentIndex];
      if (!this.shownPhotoIds.has(id)) {
        batch.push(id);
        this.shownPhotoIds.add(id);
      }
      this.currentIndex++;
    }

    return batch;
  }

  /**
   * Check if there are more photos available
   */
  hasMore(): boolean {
    return this.currentIndex < this.shuffledIds.length;
  }

  /**
   * Get total number of available photos
   */
  getTotalCount(): number {
    return this.shuffledIds.length;
  }

  /**
   * Get number of photos already shown
   */
  getShownCount(): number {
    return this.shownPhotoIds.size;
  }
}
