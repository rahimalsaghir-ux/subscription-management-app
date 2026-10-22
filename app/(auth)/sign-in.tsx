import { colors } from "@/constants/theme";
import { getErrorMessage } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { useSignIn } from "@clerk/expo";
import clsx from "clsx";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignInScreen() {
  const { signIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const disabled = loading || !emailAddress || !password;

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      setErrorMessage(getErrorMessage(error));
      setLoading(false);
      return;
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setErrorMessage(getErrorMessage(finalizeError));
      } else {
        posthog?.capture("sign_in_succeeded");
        posthogLogger.signInSucceeded();
      }
      // After finalize, the root layout automatically moves the user to (tabs).
    } else {
      setErrorMessage("Additional verification is required to sign in.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurrly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errorMessage && "auth-input-error",
                    )}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                  />
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errorMessage && "auth-input-error",
                    )}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry
                    onChangeText={setPassword}
                  />
                </View>

                {errorMessage ? (
                  <Text className="auth-error">{errorMessage}</Text>
                ) : null}

                <Pressable
                  className={clsx(
                    "auth-button",
                    disabled && "auth-button-disabled",
                  )}
                  onPress={handleSignIn}
                  disabled={disabled}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurrly?</Text>
                <Link href="/sign-up">
                  <Text className="auth-link">Create account</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
