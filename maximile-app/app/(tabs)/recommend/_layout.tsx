import { Stack, useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/theme';

/**
 * Back button matching the root layout's BackButton style (← Back in brand gold).
 * Falls back to the tabs home if there's nothing to go back to.
 */
function BackButton() {
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
