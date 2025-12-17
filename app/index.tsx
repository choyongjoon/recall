import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FeedItem } from "../src/components/feed/FeedItem";
import { PermissionGuide } from "../src/components/permission/PermissionGuide";
import { useInfinitePhotos } from "../src/hooks/useInfinitePhotos";
import { usePermissions } from "../src/hooks/usePermissions";
import type { FeedPhoto } from "../src/types/photo";
import { COLORS } from "../src/utils/constants";

export default function FeedScreen() {
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

  const renderItem = useCallback(
    ({ item }: { item: FeedPhoto }) => <FeedItem photo={item} />,
    []
  );

  const keyExtractor = useCallback((item: FeedPhoto) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.textSecondary} size="small" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
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
    <SafeAreaView edges={["top"]} style={styles.container}>
      <FlashList
        contentContainerStyle={styles.listContent}
        data={photos}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={isRefreshing}
            tintColor={COLORS.textSecondary}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
  listContent: {
    paddingTop: 8,
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
