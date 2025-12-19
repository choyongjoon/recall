import { Image } from "expo-image";
import { memo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { COLORS } from "../../utils/constants";

type PhotoThumbnailProps = {
  uri: string;
  width: number;
  height: number;
};

function PhotoThumbnailComponent({ uri, width, height }: PhotoThumbnailProps) {
  const { width: screenWidth } = useWindowDimensions();
  const aspectRatio = width / height;
  const containerWidth = screenWidth;
  const containerHeight = containerWidth / aspectRatio;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: isLoaded ? "transparent" : COLORS.skeleton,
        },
      ]}
    >
      <Image
        cachePolicy="memory-disk"
        contentFit="cover"
        onLoadEnd={() => setIsLoaded(true)}
        onLoadStart={() => setIsLoaded(false)}
        recyclingKey={uri}
        source={{ uri }}
        style={styles.image}
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  image: {
    width: "100%",
    height: "100%",
  },
});

export const PhotoThumbnail = memo(PhotoThumbnailComponent);
