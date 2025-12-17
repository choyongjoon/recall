import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, SIZES } from "../../utils/constants";

type MetadataSectionProps = {
  title: string;
  timeAgo: string;
};

function MetadataSectionComponent({ title, timeAgo }: MetadataSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text numberOfLines={SIZES.titleMaxLines} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: SIZES.thumbnailMetadataGap,
  },
  avatar: {
    width: SIZES.avatarSize,
    height: SIZES.avatarSize,
    borderRadius: SIZES.avatarSize / 2,
    backgroundColor: COLORS.avatarBackground,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.titleFontSize,
    fontWeight: "500",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  timeAgo: {
    fontSize: SIZES.timeFontSize,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export const MetadataSection = memo(MetadataSectionComponent);
