import React, { memo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../../utils/constants';

interface PhotoThumbnailProps {
  uri: string;
}

function PhotoThumbnailComponent({ uri }: PhotoThumbnailProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - SIZES.horizontalPadding * 2;
  const containerHeight = containerWidth / SIZES.thumbnailAspectRatio;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
        },
      ]}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="contain"
        transition={200}
        cachePolicy="memory-disk"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.letterbox,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export const PhotoThumbnail = memo(PhotoThumbnailComponent);
