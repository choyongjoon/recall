import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FeedItem } from "../src/components/feed/FeedItem";
import { PortraitSection } from "../src/components/feed/PortraitSection";
import { AppHeader, HEADER_HEIGHT } from "../src/components/header/AppHeader";
import { PermissionGuide } from "../src/components/permission/PermissionGuide";
import {
  HiddenRefreshControl,
  RefreshProgressBar,
  useRefreshProgress,
} from "../src/components/refresh/CustomRefreshControl";
import { useInfinitePhotos } from "../src/hooks/useInfinitePhotos";
import { usePermissions } from "../src/hooks/usePermissions";
import { type FeedPhoto, isPortraitPhoto } from "../src/types/photo";
import { COLORS } from "../src/utils/constants";

// Feed item types for mixed content
type FeedItemType =
  | { type: "landscape"; photo: FeedPhoto }
  | { type: "portrait-section"; photos: FeedPhoto[]; sectionIndex: number };

const LANDSCAPE_BETWEEN_PORTRAIT_SECTIONS = 5;
const MAX_PORTRAIT_PER_SECTION = 6;

function buildMixedFeed(
  portrait: FeedPhoto[],
  landscape: FeedPhoto[]
): FeedItemType[] {
  const items: FeedItemType[] = [];
  let portraitIndex = 0;
  let landscapeIndex = 0;
  let sectionIndex = 0;

  while (portraitIndex < portrait.length || landscapeIndex < landscape.length) {
    // Add portrait section if available
    if (portraitIndex < portrait.length) {
      const sectionPhotos = portrait.slice(
        portraitIndex,
        portraitIndex + MAX_PORTRAIT_PER_SECTION
      );
      items.push({
        type: "portrait-section",
        photos: sectionPhotos,
        sectionIndex,
      });
      portraitIndex += MAX_PORTRAIT_PER_SECTION;
      sectionIndex += 1;
    }

    // Add landscape photos
    const landscapeEnd = Math.min(
      landscapeIndex + LANDSCAPE_BETWEEN_PORTRAIT_SECTIONS,
      landscape.length
    );
    for (let i = landscapeIndex; i < landscapeEnd; i += 1) {
      items.push({ type: "landscape", photo: landscape[i] });
    }
    landscapeIndex = landscapeEnd;

    // If no more portrait photos, add remaining landscape
    if (portraitIndex >= portrait.length && landscapeIndex < landscape.length) {
      for (let i = landscapeIndex; i < landscape.length; i += 1) {
        items.push({ type: "landscape", photo: landscape[i] });
      }
      break;
    }
  }

  return items;
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const isHeaderVisible = useRef(true);

  const { pullProgress, handleScrollForRefresh, setRefreshing } =
    useRefreshProgress();

  const {
    status,
    isLoading: isPermissionLoading,
    requestPermission,
    isGranted,
  } = usePermissions();

  const {
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
  } = useInfinitePhotos();

  useEffect(() => {
    if (isGranted) {
      initialize();
    }
  }, [isGranted, initialize]);

  useEffect(() => {
    setRefreshing(isRefreshing);
  }, [isRefreshing, setRefreshing]);

  // Create mixed feed with portrait sections interspersed
  const feedItems = useMemo(() => {
    const portrait: FeedPhoto[] = [];
    const landscape: FeedPhoto[] = [];

    for (const photo of photos) {
      if (isPortraitPhoto(photo)) {
        portrait.push(photo);
      } else {
        landscape.push(photo);
      }
    }

    return buildMixedFeed(portrait, landscape);
  }, [photos]);

  const headerHeight = HEADER_HEIGHT + insets.top;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      // Update refresh progress bar
      handleScrollForRefresh(event);

      // Determine if header should be visible
      let shouldShow = isHeaderVisible.current;

      if (currentScrollY <= 0) {
        // At top, always show
        shouldShow = true;
      } else if (diff > 5) {
        // Scrolling down
        shouldShow = false;
      } else if (diff < -5) {
        // Scrolling up
        shouldShow = true;
      }

      // Only animate if state changed
      if (shouldShow !== isHeaderVisible.current) {
        isHeaderVisible.current = shouldShow;
        Animated.spring(headerTranslateY, {
          toValue: shouldShow ? 0 : -headerHeight,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }).start();
      }

      lastScrollY.current = currentScrollY;
    },
    [headerHeight, headerTranslateY, handleScrollForRefresh]
  );

  const renderItem = useCallback(({ item }: { item: FeedItemType }) => {
    if (item.type === "portrait-section") {
      return <PortraitSection photos={item.photos} />;
    }
    return <FeedItem photo={item.photo} />;
  }, []);

  const keyExtractor = useCallback((item: FeedItemType) => {
    if (item.type === "portrait-section") {
      return `portrait-section-${item.sectionIndex}`;
    }
    return item.photo.id;
  }, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.textSecondary} size="small" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>사진이 없습니다</Text>
        <Text style={styles.emptySubtext}>
          사진 라이브러리에 사진을 추가해 주세요
        </Text>
      </View>
    );
  }, [isLoading]);

  // Show loading while checking permissions
  if (isPermissionLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.textSecondary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Show permission guide if not granted
  if (!isGranted) {
    return (
      <SafeAreaView style={styles.container}>
        <PermissionGuide
          onRequestPermission={requestPermission}
          showSettingsButton={status === "denied"}
        />
      </SafeAreaView>
    );
  }

  // Show loading while fetching initial photos
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.textSecondary} size="large" />
          <Text style={styles.loadingText}>사진을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>오류가 발생했습니다</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlashList
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 8,
        }}
        data={feedItems}
        getItemType={(item) => item.type}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshControl={
          <HiddenRefreshControl
            onRefresh={refresh}
            progressViewOffset={headerHeight}
            refreshing={isRefreshing}
          />
        }
        renderItem={renderItem}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
      <RefreshProgressBar pullProgress={pullProgress} top={headerHeight} />
      <AppHeader translateY={headerTranslateY} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
