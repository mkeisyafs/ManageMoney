import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  FileText,
  BarChart2,
  Wallet,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react-native";

function TabIcon({
  Icon,
  label,
  focused,
  color,
}: {
  Icon: LucideIcon;
  label: string;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={styles.tabIconContainer}>
      <Icon size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
      <Text
        style={[styles.label, { color, fontWeight: focused ? "600" : "400" }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      initialRouteName="transactions"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.expense,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transaksi",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={FileText}
              label="Transaksi"
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistik",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={BarChart2}
              label="Statistik"
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Aset",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={Wallet}
              label="Aset"
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Lainnya",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={MoreHorizontal}
              label="Lainnya"
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
        redirect
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  label: {
    fontSize: 9,
    marginTop: 2,
    textAlign: "center",
  },
});
