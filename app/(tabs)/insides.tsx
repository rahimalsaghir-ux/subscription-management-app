import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
export default function Insides() {
  return (
    <SafeAreaView className="felx-1 bg-background p-5">
      <Text>Insides</Text>
    </SafeAreaView>
  );
}
