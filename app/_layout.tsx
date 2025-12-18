import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PhotoProvider } from "../src/context/PhotoContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PhotoProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: "none" }}>
            <Stack.Screen name="index" />
            <Stack.Screen
              name="photo/[id]"
              options={{
                presentation: "transparentModal",
                contentStyle: { backgroundColor: "transparent" },
              }}
            />
          </Stack>
        </PhotoProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
