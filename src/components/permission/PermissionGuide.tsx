import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS } from '../../utils/constants';

interface PermissionGuideProps {
  onRequestPermission: () => void;
  showSettingsButton?: boolean;
}

export function PermissionGuide({
  onRequestPermission,
  showSettingsButton = false,
}: PermissionGuideProps) {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>📷</Text>
      </View>

      <Text style={styles.title}>사진 접근 권한이 필요합니다</Text>

      <Text style={styles.description}>
        Recall은 사진 라이브러리에서 추억을 무작위로 보여드립니다.{'\n'}
        사진에 접근하려면 권한이 필요합니다.
      </Text>

      {showSettingsButton ? (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleOpenSettings}>
            <Text style={styles.buttonText}>설정에서 권한 허용하기</Text>
          </Pressable>
          <Text style={styles.hint}>
            설정 {'>'} Recall {'>'} 사진 {'>'} 모든 사진
          </Text>
        </View>
      ) : (
        <Pressable style={styles.button} onPress={onRequestPermission}>
          <Text style={styles.buttonText}>권한 허용하기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: COLORS.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});
