import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname } from "expo-router";
import { useCallback } from "react";
import { COLORS } from "../../src/utils/constants";
import { triggerScrollToTop } from "../../src/utils/scrollToTop";

export default function TabsLayout() {
  const pathname = usePathname();

  const handleHomePress = useCallback(() => {
    if (pathname === "/" || pathname === "/index") {
      triggerScrollToTop();
    }
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.separator,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        listeners={{
          tabPress: handleHomePress,
        }}
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: "재생목록",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="list" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
