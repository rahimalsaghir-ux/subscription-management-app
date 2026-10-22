import { colors } from "@/constants/theme";
import { getErrorMessage } from "@/lib/auth";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { useSignUp } from "@clerk/expo";
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

export default function SignUpScreen() {
  const { signUp } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const signUpDisabled = loading || !emailAddress || !password;
  const verifyDisabled = loading || !code;

  const handleSignUp = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      setErrorMessage(getErrorMessage(error));
      setLoading(false);
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setErrorMessage(getErrorMessage(sendError));
      setLoading(false);
      return;
    }

    posthog?.capture("sign_up_started");
    posthogLogger.signUpVerificationSent();
    setIsVerifying(true);
    setLoading(false);
  };

  const handleResend = async () => {
    setErrorMessage("");
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setErrorMessage(getErrorMessage(error));
      return;
    }

    posthog?.capture("verification_code_resent");
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMessage("");

    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setErrorMessage(getErrorMessage(error));
      setLoading(false);
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      setErrorMessage(getErrorMessage(finalizeError));
    } else {
      posthog?.capture("sign_up_completed");
      posthogLogger.signUpCompleted();
    }
    // After finalize, the root layout automatically moves the user to (tabs).
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

              <Text className="auth-title">
                {isVerifying ? "Verify your email" : "Create account"}
              </Text>
              <Text className="auth-subtitle">
                {isVerifying
                  ? "Enter the code we sent to your email"
                  : "Sign up to start tracking your subscriptions"}
              </Text>
            </View>

            <View className="auth-card">
              {isVerifying ? (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errorMessage && "auth-input-error",
                      )}
                      value={code}
                      placeholder="Enter the code"
                      placeholderTextColor={colors.mutedForeground}
                      onChangeText={setCode}
                      keyboardType="numeric"
                    />
                  </View>

                  {errorMessage ? (
                    <Text className="auth-error">{errorMessage}</Text>
                  ) : null}

                  <Pressable
                    className={clsx(
                      "auth-button",
                      verifyDisabled && "auth-button-disabled",
                    )}
                    onPress={handleVerify}
                    disabled={verifyDisabled}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <Text className="auth-button-text">Verify</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={handleResend}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
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
                        placeholder="Create a password"
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
                        signUpDisabled && "auth-button-disabled",
                      )}
                      onPress={handleSignUp}
                      disabled={signUpDisabled}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.primary} />
                      ) : (
                        <Text className="auth-button-text">Sign up</Text>
                      )}
                    </Pressable>
                  </View>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">
                      Already have an account?
                    </Text>
                    <Link href="/sign-in">
                      <Text className="auth-link">Sign in</Text>
                    </Link>
                  </View>
                </>
              )}

              {/* Needed only for web sign-up with legacy bot protection; ignored on iOS/Android */}
              <View nativeID="clerk-captcha" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
