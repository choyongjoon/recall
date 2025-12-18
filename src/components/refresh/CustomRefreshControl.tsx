import { memo, useCallback, useRef } from "react";
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { COLORS } from "../../utils/constants";

const REFRESH_THRESHOLD = 140;
const PROGRESS_BAR_HEIGHT = 3;
const MIN_OPACITY = 0.3;
const MAX_OPACITY = 0.9;

export function useRefreshProgress() {
  const pullProgress = useRef(new Animated.Value(0)).current;
  const isRefreshingRef = useRef(false);

  const handleScrollForRefresh = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isRefreshingRef.current) {
        return;
      }

      const offsetY = event.nativeEvent.contentOffset.y;

      if (offsetY < 0) {
        const progress = Math.min(Math.abs(offsetY) / REFRESH_THRESHOLD, 1);
        pullProgress.setValue(progress);
      } else {
        pullProgress.setValue(0);
      }
    },
    [pullProgress]
  );

  const setRefreshing = useCallback(
    (refreshing: boolean) => {
      isRefreshingRef.current = refreshing;

      if (refreshing) {
        pullProgress.setValue(1);
      } else {
        Animated.timing(pullProgress, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    },
    [pullProgress]
  );

  return {
    pullProgress,
    handleScrollForRefresh,
    setRefreshing,
  };
}

type RefreshProgressBarProps = {
  pullProgress: Animated.Value;
  top?: number;
};

function RefreshProgressBarComponent({
  pullProgress,
  top = 0,
}: RefreshProgressBarProps) {
  const width = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  const opacity = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [MIN_OPACITY, MAX_OPACITY],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.progressBar,
        {
          top,
          width,
          opacity,
        },
      ]}
    />
  );
}

export const RefreshProgressBar = memo(RefreshProgressBarComponent);

type HiddenRefreshControlProps = {
  refreshing: boolean;
  onRefresh: () => void;
  progressViewOffset?: number;
};

function HiddenRefreshControlComponent({
  refreshing,
  onRefresh,
  progressViewOffset = 0,
}: HiddenRefreshControlProps) {
  return (
    <RefreshControl
      colors={["transparent"]}
      onRefresh={onRefresh}
      progressBackgroundColor="transparent"
      progressViewOffset={progressViewOffset}
      refreshing={refreshing}
      tintColor="transparent"
    />
  );
}

export const HiddenRefreshControl = memo(HiddenRefreshControlComponent);

const styles = StyleSheet.create({
  progressBar: {
    position: "absolute",
    left: 0,
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: COLORS.textSecondary,
    zIndex: 100,
  },
});
