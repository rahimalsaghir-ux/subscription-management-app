import "@/global.css";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { useEffect, useRef } from "react";

import { posthog } from "@/lib/posthog";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

SplashScreen.preventAutoHideAsync();

function PostHogIdentity() {
  const posthogClient = usePostHog();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) {
      return;
    }

    if (isSignedIn && user?.id) {
      if (identifiedUserId.current !== user.id) {
        const email = user.primaryEmailAddress?.emailAddress;

        if (email) {
          posthogClient.identify(user.id, { $set: { email } });
        } else {
          posthogClient.identify(user.id);
        }

        identifiedUserId.current = user.id;
      }

      return;
    }

    if (identifiedUserId.current !== null) {
      posthogClient.reset();
      identifiedUserId.current = null;
    }
  }, [isAuthLoaded, isSignedIn, isUserLoaded, posthogClient, user]);

  return null;
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  // TEMP DEBUG: احذف هالسطر بعد ما تحل مشكلة الويب
  console.log("AUTH STATE", { isLoaded, isSignedIn });

  if (!isLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const content = <RootNavigator />;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {posthog ? (
        <PostHogProvider client={posthog}>
          <PostHogIdentity />
          {content}
        </PostHogProvider>
      ) : (
        content
      )}
    </ClerkProvider>
  );
}
