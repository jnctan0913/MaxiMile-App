import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/theme';

/**
 * Back button that routes explicitly based on context:
 *  - Bills subcategory results → back to bills subcategory picker
 *  - All other categories → back to Recommend tab (home)
 */
function BackButton() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();

  const handlePress = () => {
    if (category === 'bills') {
      // Bills results → back to bills subcategory picker
      router.replace('/(tabs)/bills-subcategory');
    } else {
      // Non-bills categories → back to Recommend tab
      router.replace('/(tabs)');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Text style={{ color: Colors.brandGold, fontSize: 16, fontWeight: '600' }}>
        ← Back
      </Text>
    </TouchableOpacity>
  );
}

export default function RecommendLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: Colors.brandGold,
        headerStyle: { backgroundColor: Colors.background },
        headerTitleStyle: {
          fontWeight: '600',
          color: Colors.textPrimary,
        },
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="[category]"
        options={{ headerTitle: 'Recommendation' }}
      />
    </Stack>
  );
}
