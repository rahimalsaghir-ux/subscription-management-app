import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { posthog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();

  // بيانات المستخدم الحقيقية من Clerk، مع الرجوع للقيم الثابتة إذا ما توفرت
  const displayName =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    HOME_USER.name;
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  // مراقب الحالة الذكي لتمدد وانغلاق الكروت العمودية
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  // تنسيق تاريخ التجديد المأخوذ من البيانات الثابتة
  const formattedDate = dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD");

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        // 🛠️ التعديل 1: حقن كامل البنية العلوية هنا مع أقواس الارتجاع التلقائي () لضمان الظهور والتمرير السلس
        ListHeaderComponent={() => (
          <View>
            {/* أ) هيدر المستخدم العلوي */}
            <View className="home-header flex-row justify-between items-center mb-5">
              <View className="home-user flex-row items-center gap-3">
                <Image
                  source={avatarSource}
                  className="home-avatar w-10 h-10 rounded-full"
                />
                <Text className="home-user-name font-sans-bold text-foreground text-lg">
                  {displayName}
                </Text>
              </View>
              <Image className="home-add-icon w-6 h-6" source={icons.add} />
            </View>

            {/* ب) كرت الميزانية والرصيد الإجمالي */}
            <View className="home-balance-card bg-primary p-5 rounded-3xl mb-6">
              <Text className="home-balance-label font-sans-medium text-white/70 text-sm mb-1">
                Total Spent
              </Text>
              <View className="flex-row justify-between items-end">
                <Text className="home-balance-amount font-sans-extrabold text-white text-3xl">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date font-sans-semibold text-white/90 text-sm">
                  {formattedDate}
                </Text>
              </View>
            </View>

            {/* ج) قسم قائمة الاشتراكات القادمة (الأفقية) */}
            <View className="mb-6">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard item={item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state font-sans-medium text-muted text-center py-4">
                    No upcoming renewal yet.
                  </Text>
                }
              />
            </View>

            {/* د) عنوان القائمة العمودية السفلية */}
            <View className="mb-3">
              <ListHeading title="All Subscriptions" />
            </View>
          </View>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const expanded = expandedSubscriptionId !== item.id;
              posthog?.capture("subscription_details_toggled", { expanded });
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              );
            }}
          />
        )}
        // 🛠️ التعديل 2: إجبار القائمة على مراقبة الحالة لإعادة الرندر الفوري عند النقر
        extraData={expandedSubscriptionId}
        // 🛠️ التعديل 3: إضافة فاصل ميكانيكي أنيق بمساحة 16 درجة بين الكروت
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state font-sans-medium text-muted text-center py-4">
            No Subscriptions yet
          </Text>
        }
        // 🛠️ التعديل 4: دفع الكروت للأعلى لحمايتها من الاندثار خلف الأيقونات السفلي العائم
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </SafeAreaView>
  );
}
