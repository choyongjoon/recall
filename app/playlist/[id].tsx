import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getPlaylists,
  type Playlist,
} from "../../src/services/playlistStorage";
import { COLORS } from "../../src/utils/constants";

type PhotoItem = {
  id: string;
  uri: string;
};

async function loadPhotosFromIds(photoIds: string[]): Promise<PhotoItem[]> {
  if (photoIds.length === 0) {
    return [];
  }

  try {
    const photos: PhotoItem[] = [];

    for (const photoId of photoIds) {
      try {
        const asset = await MediaLibrary.getAssetInfoAsync(photoId);
        if (asset) {
          photos.push({ id: asset.id, uri: asset.uri });
        }
      } catch {
        // Photo might have been deleted, skip it
      }
    }

    return photos;
  } catch (error) {
    console.error("Failed to load photos:", error);
    return [];
  }
}

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    const loadPlaylist = async () => {
      const playlists = await getPlaylists();
      const found = playlists.find((p) => p.id === id);
      if (found) {
        setPlaylist(found);
        const loadedPhotos = await loadPhotosFromIds(found.photoIds);
        setPhotos(loadedPhotos);
      }
    };

    loadPlaylist();
  }, [id]);

  const renderPhoto = useCallback(
    ({ item }: { item: PhotoItem }) => (
      <Pressable
        onPress={() => router.push(`/photo/${encodeURIComponent(item.id)}`)}
        style={styles.photoItem}
      >
        <Image source={{ uri: item.uri }} style={styles.photoImage} />
      </Pressable>
    ),
    [router]
  );

  const renderHeader = useCallback(() => {
    if (!playlist) {
      return null;
    }
    return (
      <View style={styles.headerInfo}>
        <View style={styles.playlistIconLarge}>
          <Ionicons
            color={COLORS.textSecondary}
            name={playlist.isDefault ? "heart" : "list"}
            size={48}
          />
        </View>
        <Text style={styles.playlistTitle}>{playlist.name}</Text>
        <Text style={styles.photoCount}>{photos.length}개의 사진</Text>
      </View>
    );
  }, [playlist, photos.length]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons
          color={COLORS.textSecondary}
          name="images-outline"
          size={48}
        />
        <Text style={styles.emptyText}>저장된 사진이 없습니다</Text>
      </View>
    ),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.navHeader}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color={COLORS.textPrimary} name="arrow-back" size={24} />
        </Pressable>
        <Text style={styles.navTitle}>{playlist?.name ?? ""}</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={photos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
        numColumns={3}
        renderItem={renderPhoto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingBottom: 20,
  },
  headerInfo: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  playlistIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  photoCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  photoItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  photoImage: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.skeleton,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
