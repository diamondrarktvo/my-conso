import { Linking } from "react-native";
import { Screen } from "../layout/screen";
import { ThemedButton } from "../ui/themed-button";
import { IconName, ThemedIcon } from "../ui/themed-icon";
import { ThemedText } from "../ui/themed-text";
import { ThemedView } from "../ui/themed-view";

interface PermissionScreenProps {
    title_request: string;
    title_denied: string;
    description_request: string;
    description_denied: string;
    button_request_title: string;
    button_settings_title: string;
    iconName: IconName;
    canAskAgain: boolean;
    onRequestPermission: () => void;
    primaryColor: string;
    t: (key: string) => string;
}

export function PermissionScreen({
    title_request,
    title_denied,
    description_request,
    description_denied,
    button_request_title,
    button_settings_title,
    iconName,
    canAskAgain,
    onRequestPermission,
    primaryColor,
    t,
}: PermissionScreenProps) {
   return (
      <Screen withSmallPadding>
         <ThemedView className="flex-1 items-center justify-center gap-8 px-2">
            {/* Icon badge */}
            <ThemedView
               className="w-28 h-28 rounded-full items-center justify-center"
               style={{ backgroundColor: primaryColor + '1A' }}>
               <ThemedView
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{ backgroundColor: primaryColor + '33' }}>
                    <ThemedIcon name={iconName} strokeWidth={1.5} size="sm" />
               </ThemedView>
            </ThemedView>

            {/* Text */}
            <ThemedView className="items-center gap-3">
               <ThemedText variant="h2" weight="bold" align="center">
                  {canAskAgain
                     ? title_request
                     : title_denied}
               </ThemedText>
               <ThemedText
                  variant="body"
                  color="secondary"
                  align="center"
                  leading="relaxed">
                  {canAskAgain
                     ? description_request
                     : description_denied}
               </ThemedText>
            </ThemedView>

            {/* Action */}
            {canAskAgain ? (
               <ThemedButton
                  title={button_request_title}
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={onRequestPermission}
               />
            ) : (
               <ThemedButton
                  title={button_settings_title}
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<ThemedIcon name="settings" />}
                  onPress={() => Linking.openSettings()}
               />
            )}
         </ThemedView>
      </Screen>
   );
}
