import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  addPhotoToPlaylist,
  createPlaylist,
  getPlaylists,
  getPlaylistsForPhoto,
  type Playlist,
  removePhotoFromPlaylist,
} from "../../services/playlistStorage";
import { COLORS } from "../../utils/constants";

type PlaylistBottomSheetProps = {
  visible: boolean;
  photoId: string;
  onClose: () => void;
};

function PlaylistBottomSheetComponent({
  visible,
  photoId,
  onClose,
}: PlaylistBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(400)).current;

  const loadData = useCallback(async () => {
    const [allPlaylists, photoPlaylists] = await Promise.all([
      getPlaylists(),
      getPlaylistsForPhoto(photoId),
    ]);
    setPlaylists(allPlaylists);
    setSelectedPlaylistIds(photoPlaylists);
  }, [photoId]);

  useEffect(() => {
    if (visible) {
      loadData();
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, loadData, backdropOpacity, sheetTranslateY]);

  const handleTogglePlaylist = useCallback(
    async (playlistId: string) => {
      const isSelected = selectedPlaylistIds.includes(playlistId);
      if (isSelected) {
        await removePhotoFromPlaylist(playlistId, photoId);
        setSelectedPlaylistIds((prev) =>
          prev.filter((id) => id !== playlistId)
        );
      } else {
        await addPhotoToPlaylist(playlistId, photoId);
        setSelectedPlaylistIds((prev) => [...prev, playlistId]);
      }
    },
    [photoId, selectedPlaylistIds]
  );

  const handleCreatePlaylist = useCallback(async () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      await addPhotoToPlaylist(newPlaylist.id, photoId);
      setPlaylists((prev) => [...prev, newPlaylist]);
      setSelectedPlaylistIds((prev) => [...prev, newPlaylist.id]);
      setNewPlaylistName("");
      setShowNewPlaylist(false);
    }
  }, [newPlaylistName, photoId]);

  const handleCancelNewPlaylist = useCallback(() => {
    setNewPlaylistName("");
    setShowNewPlaylist(false);
  }, []);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowNewPlaylist(false);
      setNewPlaylistName("");
      onClose();
    });
  }, [onClose, backdropOpacity, sheetTranslateY]);

  return (
    <Modal
      animationType="none"
      onRequestClose={handleClose}
      transparent
      visible={visible}
    >
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        <Pressable onPress={handleClose} style={styles.overlayPressable} />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + 16,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>저장 위치</Text>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons color={COLORS.textPrimary} name="close" size={24} />
          </Pressable>
        </View>

        {/* Playlist List */}
        <ScrollView style={styles.listContainer}>
          {playlists
            .filter((p) => !p.isDefault)
            .map((playlist) => (
              <Pressable
                key={playlist.id}
                onPress={() => handleTogglePlaylist(playlist.id)}
                style={styles.playlistItem}
              >
                <View style={styles.playlistInfo}>
                  <Ionicons
                    color={COLORS.textSecondary}
                    name={playlist.isDefault ? "heart" : "list"}
                    size={24}
                  />
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                </View>
                <Ionicons
                  color={
                    selectedPlaylistIds.includes(playlist.id)
                      ? COLORS.textPrimary
                      : COLORS.separator
                  }
                  name={
                    selectedPlaylistIds.includes(playlist.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={24}
                />
              </Pressable>
            ))}
        </ScrollView>

        {/* Add New Playlist Button */}
        <Pressable
          onPress={() => setShowNewPlaylist(true)}
          style={styles.addButton}
        >
          <Ionicons color={COLORS.textPrimary} name="add" size={24} />
          <Text style={styles.addButtonText}>새 재생목록</Text>
        </Pressable>
      </Animated.View>

      {/* New Playlist Modal */}
      <Modal
        animationType="fade"
        onRequestClose={handleCancelNewPlaylist}
        transparent
        visible={showNewPlaylist}
      >
        <View style={styles.inputModalOverlay}>
          <View style={styles.inputModalContent}>
            <Text style={styles.inputModalTitle}>새 재생목록</Text>
            <TextInput
              autoFocus
              onChangeText={setNewPlaylistName}
              onSubmitEditing={handleCreatePlaylist}
              placeholder="재생목록 이름을 입력하세요"
              placeholderTextColor={COLORS.textSecondary}
              returnKeyType="done"
              style={styles.inputModalInput}
              value={newPlaylistName}
            />
            <View style={styles.inputModalButtons}>
              <Pressable
                onPress={handleCancelNewPlaylist}
                style={styles.inputModalCancelButton}
              >
                <Text style={styles.inputModalCancelText}>취소</Text>
              </Pressable>
              <Pressable
                onPress={handleCreatePlaylist}
                style={[
                  styles.inputModalCreateButton,
                  !newPlaylistName.trim() &&
                    styles.inputModalCreateButtonDisabled,
                ]}
              >
                <Text style={styles.inputModalCreateText}>만들기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlayPressable: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    maxHeight: 300,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  playlistInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playlistName: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.separator,
  },
  addButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  inputModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  inputModalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    width: "100%",
    padding: 20,
  },
  inputModalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  inputModalInput: {
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    height: 48,
  },
  inputModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  inputModalCancelButton: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  inputModalCancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
  },
  inputModalCreateButton: {
    flex: 1,
    backgroundColor: COLORS.textPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  inputModalCreateButtonDisabled: {
    opacity: 0.5,
  },
  inputModalCreateText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.background,
  },
});

export const PlaylistBottomSheet = memo(PlaylistBottomSheetComponent);
