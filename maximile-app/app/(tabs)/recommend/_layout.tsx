import { Stack } from 'expo-router';
import { Colors } from '../../../constants/theme';

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
