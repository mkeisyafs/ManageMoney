import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";
import { isInitialized } from "@/services/storage/mmkv";

export default function Index() {
  const { settings } = useSettings();
  const { isLocked, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check navigation target
    if (!isInitialized() || !settings.onboardingCompleted) {
      router.replace("/(auth)/onboarding");
    } else if (isLocked && !isAuthenticated) {
      router.replace("/(auth)/lock");
    } else {
      router.replace("/(tabs)");
    }
  }, [settings.onboardingCompleted, isLocked, isAuthenticated]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4caf50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
});
