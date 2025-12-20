import { FontAwesome } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  getPhotoReaction,
  type PhotoReaction,
  setPhotoReaction,
} from "../../services/playlistStorage";
import { COLORS } from "../../utils/constants";

type ActionButtonsProps = {
  photoId: string;
  onSavePress: () => void;
};

function ActionButtonsComponent({ photoId, onSavePress }: ActionButtonsProps) {
  const [reaction, setReaction] = useState<PhotoReaction>(null);

  useEffect(() => {
    getPhotoReaction(photoId).then(setReaction);
  }, [photoId]);

  const handleLike = useCallback(async () => {
    const newReaction = reaction === "like" ? null : "like";
    setReaction(newReaction);
    await setPhotoReaction(photoId, newReaction);
  }, [photoId, reaction]);

  const handleDislike = useCallback(async () => {
    const newReaction = reaction === "dislike" ? null : "dislike";
    setReaction(newReaction);
    await setPhotoReaction(photoId, newReaction);
  }, [photoId, reaction]);

  return (
    <View style={styles.container}>
      {/* Like Button */}
      <Pressable onPress={handleLike} style={styles.button}>
        <FontAwesome
          color={
            reaction === "like" ? COLORS.textPrimary : COLORS.textSecondary
          }
          name={reaction === "like" ? "thumbs-up" : "thumbs-o-up"}
          size={20}
        />
        <Text
          style={[
            styles.buttonText,
            reaction === "like" && styles.buttonTextActive,
          ]}
        >
          좋아요
        </Text>
      </Pressable>

      {/* Dislike Button */}
      <Pressable onPress={handleDislike} style={styles.button}>
        <FontAwesome
          color={
            reaction === "dislike" ? COLORS.textPrimary : COLORS.textSecondary
          }
          name={reaction === "dislike" ? "thumbs-down" : "thumbs-o-down"}
          size={20}
        />
        <Text
          style={[
            styles.buttonText,
            reaction === "dislike" && styles.buttonTextActive,
          ]}
        >
          싫어요
        </Text>
      </Pressable>

      {/* Save Button */}
      <Pressable onPress={onSavePress} style={styles.button}>
        <FontAwesome color={COLORS.textSecondary} name="bookmark-o" size={20} />
        <Text style={styles.buttonText}>저장</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  buttonTextActive: {
    color: COLORS.textPrimary,
  },
});

export const ActionButtons = memo(ActionButtonsComponent);
