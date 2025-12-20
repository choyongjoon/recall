import * as Location from "expo-location";
import { memo, useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { COLORS } from "../../utils/constants";

type LocationMapProps = {
  latitude: number;
  longitude: number;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
};

function formatLocationName(
  geocode: Location.LocationGeocodedAddress
): string | null {
  const { city, district, region, country } = geocode;
  const parts: string[] = [];

  if (district) {
    parts.push(district);
  }
  if (city) {
    parts.push(city);
  }
  // Only add region if it's different from city
  if (region && region !== city) {
    parts.push(region);
  }
  if (country) {
    parts.push(country);
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

function LocationMapComponent({
  latitude,
  longitude,
  onTouchStart,
  onTouchEnd,
}: LocationMapProps) {
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (results.length > 0) {
          setLocationName(formatLocationName(results[0]));
        }
      } catch {
        // Silently fail - just don't show location name
      }
    };
    fetchLocationName();
  }, [latitude, longitude]);

  const handleTouchStart = useCallback(() => {
    onTouchStart?.();
  }, [onTouchStart]);

  const handleTouchEnd = useCallback(() => {
    // Delay to ensure map gesture is complete
    setTimeout(() => {
      onTouchEnd?.();
    }, 100);
  }, [onTouchEnd]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>촬영 위치</Text>
        {locationName ? (
          <Text style={styles.locationName}>{locationName}</Text>
        ) : null}
      </View>
      <View
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        style={styles.mapContainer}
      >
        <MapView
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          style={styles.map}
        >
          <Marker coordinate={{ latitude, longitude }} />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  locationName: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  mapContainer: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});

export const LocationMap = memo(LocationMapComponent);
