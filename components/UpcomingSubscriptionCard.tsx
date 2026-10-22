import { formatCurrency } from "@/lib/utils"; // دالة تنسيق العملة المعتمدة في الكورس
import { Image, Text, View } from "react-native";

// تعريف الـ Props لتطابق الأنماط والداتا المستوردة في الدقيقة 01:51:56
interface UpcomingSubscriptionCardProps {
  item: {
    id: string;
    icon: any;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  };
}

export default function UpcomingSubscriptionCard({
  item,
}: UpcomingSubscriptionCardProps) {
  // تفكيك الخصائص مع مراعاة حالة الأحرف الحساسة لـ daysLeft (حرف L كبير) كما في الداتا
  const { name, price, currency, daysLeft, icon } = item;

  return (
    // الكرت الخارجي مع الهوامش وأبعاد الـ Carousel الأفقي
    <View className="upcoming-card mr-4 bg-card p-4 rounded-2xl w-40">
      <View className="upcoming-row flex-row justify-between items-center mb-3">
        {/* أيقونة الشركة */}
        <Image
          source={icon}
          className="upcoming-icon w-10 h-10"
          resizeMode="contain"
        />

        {/* قسم السعر والأيام المتبقية */}
        <View className="items-end">
          <Text className="upcoming-price font-sans-bold text-base text-foreground">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta font-sans-medium text-[10px] text-muted mt-0.5">
            {/* الشرط البرمجي لضبط صيغة المفرد والجمع للأيام كمظهر نهائي في الكورس */}
            {daysLeft > 1 ? `${daysLeft} days left` : "Last day"}
          </Text>
        </View>
      </View>

      {/* اسم التبويب أو الشركة في الأسفل */}
      <Text
        className="upcoming-name font-sans-semibold text-sm text-foreground"
        numberOfLines={1}
      >
        {name}
      </Text>
    </View>
  );
}
