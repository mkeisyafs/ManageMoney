import { Stack } from "expo-router";

export default function TransactionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="income" />
      <Stack.Screen name="expense" />
      <Stack.Screen name="transfer" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
