import { useCallback, useRef, useState } from "react";
import { fetchAllPhotos } from "../services/photoService";
import { PhotoSessionManager } from "../services/shuffleService";
import type { FeedPhoto, PhotoAsset } from "../types/photo";
import { FEED } from "../utils/constants";
import { formatTimeAgo } from "../utils/formatters";
import { generatePhotoTitle } from "../utils/titleGenerator";

function mapToFeedPhoto(photo: PhotoAsset): FeedPhoto {
  return {
    ...photo,
    title: generatePhotoTitle(photo),
    timeAgo: formatTimeAgo(photo.creationTime),
  };
}

export function useInfinitePhotos() {
  const [photos, setPhotos] = useState<FeedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const sessionManager = useRef(new PhotoSessionManager());
  const isInitialized = useRef(false);

  const loadBatch = useCallback((count: number): FeedPhoto[] => {
    const assets = sessionManager.current.getNextBatch(count);
    return assets.map(mapToFeedPhoto);
  }, []);

  const initialize = useCallback(async () => {
    if (isInitialized.current) {
      return;
    }

    const startTime = Date.now();
    console.log("[PERF] initialize: started");

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all photos (this uses getAssetsAsync which is fast)
      const allPhotos = await fetchAllPhotos();
      console.log(
        `[PERF] initialize: fetched ${allPhotos.length} photos in ${Date.now() - startTime}ms`
      );

      if (allPhotos.length === 0) {
        setPhotos([]);
        setHasMore(false);
        setIsLoading(false);
        isInitialized.current = true;
        return;
      }

      // Initialize session manager with shuffled photos
      sessionManager.current.initialize(allPhotos);

      // Get first batch to display
      const initialBatch = loadBatch(FEED.displayBatchSize);
      setPhotos(initialBatch);
      setHasMore(sessionManager.current.hasMore());

      isInitialized.current = true;
      console.log(`[PERF] initialize: total time ${Date.now() - startTime}ms`);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load photos"));
    } finally {
      setIsLoading(false);
    }
  }, [loadBatch]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const newPhotos = loadBatch(FEED.displayBatchSize);

      if (newPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }

      setHasMore(sessionManager.current.hasMore());
    } catch (err) {
      console.error("Failed to load more photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, loadBatch]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);

    // Small delay to show the refresh indicator
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      // Re-shuffle existing photos
      sessionManager.current.reset();

      const freshBatch = loadBatch(FEED.displayBatchSize);
      setPhotos(freshBatch);
      setHasMore(sessionManager.current.hasMore());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh"));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadBatch]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length === 0) {
        return;
      }

      const lastVisibleIndex = Math.max(
        ...viewableItems.map((item) => item.index ?? 0)
      );
      const totalLoaded = photos.length;
      const threshold = totalLoaded - FEED.displayBatchSize;

      // If user is near the end, trigger load more
      if (lastVisibleIndex >= threshold && !isLoadingMore && hasMore) {
        loadMore();
      }
    },
    [photos.length, isLoadingMore, hasMore, loadMore]
  );

  return {
    photos,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    error,
    initialize,
    loadMore,
    refresh,
    onViewableItemsChanged,
  };
}
