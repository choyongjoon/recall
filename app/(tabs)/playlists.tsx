import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  createPlaylist,
  getPlaylists,
  type Playlist,
} from "../../src/services/playlistStorage";
import { COLORS } from "../../src/utils/constants";

export default function PlaylistsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const loadPlaylists = useCallback(async () => {
    const data = await getPlaylists();
    setPlaylists(data);
  }, []);

  // Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, [loadPlaylists])
  );

  const handleCreatePlaylist = useCallback(async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowNewPlaylist(false);
      loadPlaylists();
    }
  }, [newPlaylistName, loadPlaylists]);

  const handleCancelNewPlaylist = useCallback(() => {
    setNewPlaylistName("");
    setShowNewPlaylist(false);
  }, []);

  const renderPlaylistItem = useCallback(
    ({ item }: { item: Playlist }) => (
      <Pressable
        onPress={() => router.push(`/playlist/${item.id}`)}
        style={styles.playlistItem}
      >
        <View style={styles.playlistIcon}>
          <Ionicons
            color={COLORS.textSecondary}
            name={item.isDefault ? "heart" : "list"}
            size={28}
          />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistName}>{item.name}</Text>
          <Text style={styles.playlistCount}>
            {item.photoIds.length}개의 사진
          </Text>
        </View>
        <Ionicons
          color={COLORS.textSecondary}
          name="chevron-forward"
          size={20}
        />
      </Pressable>
    ),
    [router]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>재생목록</Text>
      </View>
    ),
    []
  );

  const renderFooter = useCallback(
    () => (
      <Pressable
        onPress={() => setShowNewPlaylist(true)}
        style={styles.addButton}
      >
        <Ionicons
          color={COLORS.textPrimary}
          name="add-circle-outline"
          size={24}
        />
        <Text style={styles.addButtonText}>새 재생목록 만들기</Text>
      </Pressable>
    ),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={playlists}
        keyExtractor={(item) => item.id}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        renderItem={renderPlaylistItem}
      />

      {/* New Playlist Modal */}
      <Modal
        animationType="fade"
        onRequestClose={handleCancelNewPlaylist}
        transparent
        visible={showNewPlaylist}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 재생목록</Text>
            <TextInput
              autoFocus
              onChangeText={setNewPlaylistName}
              onSubmitEditing={handleCreatePlaylist}
              placeholder="재생목록 이름을 입력하세요"
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="done"
              style={styles.modalInput}
              value={newPlaylistName}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={handleCancelNewPlaylist}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={handleCreatePlaylist}
                style={[
                  styles.modalCreateButton,
                  !newPlaylistName.trim() && styles.modalCreateButtonDisabled,
                ]}
              >
                <Text style={styles.modalCreateText}>만들기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  playlistCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    width: "100%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    height: 48,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: COLORS.textPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCreateButtonDisabled: {
    opacity: 0.5,
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.background,
  },
});
