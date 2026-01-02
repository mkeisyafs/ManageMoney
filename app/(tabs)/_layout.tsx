import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Home,
  ArrowLeftRight,
  CreditCard,
  BarChart3,
  Settings,
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
      <Icon
        size={24}
        color={color}
        strokeWidth={focused ? 2.5 : 2}
      />
      <Text
        style={[styles.label, { color, fontWeight: focused ? "600" : "400" }]}
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
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={Home}
              label="Beranda"
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={ArrowLeftRight}
              label="Transaksi"
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
          title: "Accounts",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon Icon={CreditCard} label="Akun" focused={focused} color={color} />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={BarChart3}
              label="Statistik"
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
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              Icon={Settings}
              label="Pengaturan"
              focused={focused}
              color={color}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
