import { useCallback, useRef, useState } from "react";
import { fetchAllPhotoIds, fetchPhotosByIds } from "../services/photoService";
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
  const preloadedPhotos = useRef<FeedPhoto[]>([]);
  const isPreloading = useRef(false);

  const loadBatch = useCallback(async (count: number): Promise<FeedPhoto[]> => {
    const ids = sessionManager.current.getNextBatch(count);
    if (ids.length === 0) {
      return [];
    }

    const assets = await fetchPhotosByIds(ids);
    return assets.map(mapToFeedPhoto);
  }, []);

  const preloadNextBatch = useCallback(async () => {
    if (isPreloading.current || !sessionManager.current.hasMore()) {
      return;
    }

    isPreloading.current = true;
    try {
      const batch = await loadBatch(FEED.batchSize);
      preloadedPhotos.current = batch;
    } catch (error) {
      console.warn("Failed to preload batch:", error);
    } finally {
      isPreloading.current = false;
    }
  }, [loadBatch]);

  const initialize = useCallback(async () => {
    if (isInitialized.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const allIds = await fetchAllPhotoIds();

      if (allIds.length === 0) {
        setPhotos([]);
        setHasMore(false);
        setIsLoading(false);
        isInitialized.current = true;
        return;
      }

      sessionManager.current.initialize(allIds);

      const initialBatch = await loadBatch(FEED.batchSize);
      setPhotos(initialBatch);
      setHasMore(sessionManager.current.hasMore());

      // Start preloading next batch
      preloadNextBatch();

      isInitialized.current = true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load photos"));
    } finally {
      setIsLoading(false);
    }
  }, [loadBatch, preloadNextBatch]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) {
      return;
    }

    setIsLoadingMore(true);

    try {
      let newPhotos: FeedPhoto[];

      // Use preloaded photos if available
      if (preloadedPhotos.current.length > 0) {
        newPhotos = preloadedPhotos.current;
        preloadedPhotos.current = [];
      } else {
        newPhotos = await loadBatch(FEED.batchSize);
      }

      if (newPhotos.length > 0) {
        setPhotos((prev) => [...prev, ...newPhotos]);
      }

      setHasMore(sessionManager.current.hasMore());

      // Start preloading next batch
      preloadNextBatch();
    } catch (err) {
      console.error("Failed to load more photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, isLoading, loadBatch, preloadNextBatch]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    preloadedPhotos.current = [];

    try {
      sessionManager.current.reset();

      const freshBatch = await loadBatch(FEED.batchSize);
      setPhotos(freshBatch);
      setHasMore(sessionManager.current.hasMore());

      // Start preloading next batch
      preloadNextBatch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh"));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadBatch, preloadNextBatch]);

  // Handler for scroll position to trigger preloading
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length === 0) return;

      const lastVisibleIndex = Math.max(
        ...viewableItems.map((item) => item.index ?? 0)
      );
      const totalLoaded = photos.length;
      const threshold = totalLoaded * FEED.preloadThreshold;

      // If user has scrolled past 50% of loaded photos, start preloading
      if (
        lastVisibleIndex >= threshold &&
        preloadedPhotos.current.length === 0
      ) {
        preloadNextBatch();
      }
    },
    [photos.length, preloadNextBatch]
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
