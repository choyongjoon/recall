import * as MediaLibrary from "expo-media-library";
import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import type { PermissionStatus } from "../types/photo";

function mapPermissionStatus(
  response: MediaLibrary.PermissionResponse
): PermissionStatus {
  if (response.granted) {
    return "granted";
  }
  if (response.status === "undetermined") {
    return "undetermined";
  }
  if (response.accessPrivileges === "limited") {
    return "limited";
  }
  return "denied";
}

export function usePermissions() {
  const [status, setStatus] = useState<PermissionStatus>("undetermined");
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = useCallback(async () => {
    try {
      const response = await MediaLibrary.getPermissionsAsync();
      setStatus(mapPermissionStatus(response));
    } catch (error) {
      console.error("Failed to check permissions:", error);
      setStatus("denied");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await MediaLibrary.requestPermissionsAsync();
      setStatus(mapPermissionStatus(response));
    } catch (error) {
      console.error("Failed to request permissions:", error);
      setStatus("denied");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check permissions when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        checkPermission();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    status,
    isLoading,
    requestPermission,
    isGranted: status === "granted" || status === "limited",
  };
}
