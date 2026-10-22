import { Tabs } from "expo-router";

const TabLayout = () => (
  <Tabs screenOptions={{ headerShown: false }}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="subscriptions" options={{ title: "Subscriptions" }} />
    <Tabs.Screen name="insides" options={{ title: "Insides" }} />
    <Tabs.Screen name="setting" options={{ title: "Setting" }} />
  </Tabs>
);

export default TabLayout;
