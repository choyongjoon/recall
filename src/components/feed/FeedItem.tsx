import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FeedPhoto } from '../../types/photo';
import { PhotoThumbnail } from './PhotoThumbnail';
import { MetadataSection } from './MetadataSection';
import { SIZES } from '../../utils/constants';

interface FeedItemProps {
  photo: FeedPhoto;
}

function FeedItemComponent({ photo }: FeedItemProps) {
  return (
    <View style={styles.container}>
      <PhotoThumbnail uri={photo.uri} />
      <MetadataSection title={photo.title} timeAgo={photo.timeAgo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.horizontalPadding,
    paddingBottom: SIZES.itemSpacing,
  },
});

export const FeedItem = memo(FeedItemComponent);
