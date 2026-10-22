import { posthog } from "@/lib/posthog";
import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Setting() {
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleSignOut = async () => {
    posthog?.capture("sign_out_requested");
    await signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title mb-6">Settings</Text>

      <View className="mb-6 rounded-3xl border border-border bg-card p-5">
        <Text className="text-sm font-sans-medium text-muted-foreground">
          Signed in as
        </Text>
        <Text className="mt-1 text-base font-sans-semibold text-primary">
          {user?.primaryEmailAddress?.emailAddress ?? "—"}
        </Text>
      </View>

      <Pressable
        className="items-center rounded-2xl bg-accent py-4"
        onPress={handleSignOut}
      >
        <Text className="text-base font-sans-bold text-primary">Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
