import Constants from 'expo-constants';
import { ThemedText } from '@/src/components/ui/themed-text';

export const AppVersion = () => {
   const version = Constants.expoConfig?.version ?? '—';
   return (
      <ThemedText variant="caption" color="muted" className="text-center">
         v{version}
      </ThemedText>
   );
};