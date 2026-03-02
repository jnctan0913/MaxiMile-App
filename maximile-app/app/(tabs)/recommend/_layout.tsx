import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';

function BackToHome() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{ marginLeft: 4 }}
    >
      <Ionicons name="chevron-back" size={24} color={Colors.brandGold} />
    </TouchableOpacity>
  );
}

export default function RecommendLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: Colors.brandGold,
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.textPrimary,
        },
        headerLeft: () => <BackToHome />,
      }}
    >
      <Stack.Screen
        name="bills-subcategory"
        options={{ headerTitle: 'Bills' }}
      />
      <Stack.Screen
        name="[category]"
        options={{ headerTitle: 'Recommendation' }}
      />
    </Stack>
  );
}
