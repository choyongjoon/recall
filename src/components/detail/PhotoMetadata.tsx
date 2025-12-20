import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { PhotoExif } from "../../types/photo";
import { COLORS } from "../../utils/constants";

// Helper functions
export function formatDate(timestamp: number | null): string {
  if (!timestamp) {
    return "Unknown";
  }
  const date = new Date(timestamp);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatExposureTime(time: number): string {
  if (time >= 1) {
    return `${time}s`;
  }
  return `1/${Math.round(1 / time)}s`;
}

function formatFlash(flash: number): string {
  if (flash === 0) {
    return "No Flash";
  }
  // biome-ignore lint/suspicious/noBitwiseOperators: EXIF flash field uses bitwise flags
  if (flash & 1) {
    return "Flash Fired";
  }
  return "No Flash";
}

// Sub-components
export function MetadataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metadataRow}>
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text style={styles.metadataValue}>{value}</Text>
    </View>
  );
}

export function CameraSection({ exif }: { exif: PhotoExif }) {
  return (
    <>
      <Text style={[styles.sectionTitle, styles.newSection]}>Camera</Text>
      {exif.make ? <MetadataRow label="Make" value={exif.make} /> : null}
      {exif.model ? <MetadataRow label="Model" value={exif.model} /> : null}
      {exif.lensModel ? (
        <MetadataRow label="Lens" value={exif.lensModel} />
      ) : null}
      {exif.software ? (
        <MetadataRow label="Software" value={exif.software} />
      ) : null}
    </>
  );
}

export function CaptureSettingsSection({ exif }: { exif: PhotoExif }) {
  const hasSettings =
    exif.fNumber || exif.exposureTime || exif.iso || exif.focalLength;

  if (!hasSettings) {
    return null;
  }

  return (
    <>
      <Text style={[styles.sectionTitle, styles.newSection]}>
        Capture Settings
      </Text>
      {exif.fNumber ? (
        <MetadataRow label="Aperture" value={`f/${exif.fNumber}`} />
      ) : null}
      {exif.exposureTime ? (
        <MetadataRow
          label="Shutter Speed"
          value={formatExposureTime(exif.exposureTime)}
        />
      ) : null}
      {exif.iso ? <MetadataRow label="ISO" value={String(exif.iso)} /> : null}
      {exif.focalLength ? (
        <MetadataRow
          label="Focal Length"
          value={`${exif.focalLength}mm${
            exif.focalLengthIn35mm ? ` (${exif.focalLengthIn35mm}mm equiv)` : ""
          }`}
        />
      ) : null}
      {exif.flash !== undefined ? (
        <MetadataRow label="Flash" value={formatFlash(exif.flash)} />
      ) : null}
      {exif.whiteBalance !== undefined ? (
        <MetadataRow
          label="White Balance"
          value={exif.whiteBalance === 0 ? "Auto" : "Manual"}
        />
      ) : null}
    </>
  );
}

type LocationSectionProps = {
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  } | null;
  exif?: PhotoExif;
};

export function LocationSection({ location, exif }: LocationSectionProps) {
  const hasLocation = location || exif?.gpsLatitude;

  if (!hasLocation) {
    return null;
  }

  return (
    <>
      <Text style={[styles.sectionTitle, styles.newSection]}>Location</Text>
      <MetadataRow
        label="Latitude"
        value={(location?.latitude ?? exif?.gpsLatitude ?? 0).toFixed(6)}
      />
      <MetadataRow
        label="Longitude"
        value={(location?.longitude ?? exif?.gpsLongitude ?? 0).toFixed(6)}
      />
      {exif?.gpsAltitude ? (
        <MetadataRow
          label="Altitude"
          value={`${exif.gpsAltitude.toFixed(1)}m`}
        />
      ) : null}
      {location?.city ? (
        <MetadataRow label="City" value={location.city} />
      ) : null}
      {location?.country ? (
        <MetadataRow label="Country" value={location.country} />
      ) : null}
    </>
  );
}

export function LoadingSection() {
  return (
    <View style={styles.loadingSection}>
      <ActivityIndicator color={COLORS.textSecondary} size="small" />
      <Text style={styles.loadingText}>Loading EXIF data...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  newSection: {
    marginTop: 24,
  },
  loadingSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.separator,
  },
  metadataLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  metadataValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: "right",
  },
});
