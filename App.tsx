import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ToastProvider } from './src/providers/toast-provider';
import { CacheProvider } from './src/providers/cache-provider';
import { BottomSheetProvider } from './src/providers/sheet-provider';
import { ErrorProvider } from './src/providers/error-provider';
import { RootNavigator } from './src/navigation/root-navigator';

export default function App() {
   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <SafeAreaProvider>
            <ThemeProvider>
               <CacheProvider>
                  <KeyboardProvider>
                     <ToastProvider>
                        <ErrorProvider>
                           <BottomSheetProvider>
                              <RootNavigator />
                           </BottomSheetProvider>
                        </ErrorProvider>
                     </ToastProvider>
                  </KeyboardProvider>
               </CacheProvider>
            </ThemeProvider>
         </SafeAreaProvider>
      </GestureHandlerRootView>
   );
}
