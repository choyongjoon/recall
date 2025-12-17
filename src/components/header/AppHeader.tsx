import { memo } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../utils/constants";

const HEADER_HEIGHT = 44;

type AppHeaderProps = {
  translateY: Animated.AnimatedInterpolation<number>;
};

function AppHeaderComponent({ translateY }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.title}>Recall</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
});

export const AppHeader = memo(AppHeaderComponent);
export { HEADER_HEIGHT };
