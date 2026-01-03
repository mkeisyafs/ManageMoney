import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isLocked, isAuthenticated } = useAuth();

  useEffect(() => {
    // Always go to tabs (transactions is the first tab now)
    if (isLocked && !isAuthenticated) {
      router.replace("/(auth)/lock");
    } else {
      router.replace("/(tabs)");
    }
  }, [isLocked, isAuthenticated]);

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
    backgroundColor: "#121212",
  },
});
