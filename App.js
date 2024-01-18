import React, { useState, useCallback, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { FONTS } from './constants/fonts';
import { Login, Signup, Welcome, Home, User, Vip, Shop, Leaderboard, Setting} from './screens';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { LogBox } from 'react-native';
import VolumeContext from './VolumeContext'; // Đảm bảo rằng bạn đã tạo file này

LogBox.ignoreLogs(['Animated: `useNativeDriver` was not specified.']);
LogBox.ignoreLogs(['ViewPropTypes has been removed from React Native.']);
LogBox.ignoreLogs(['componentWillReceiveProps has been renamed, and is not recommended for use.']);
LogBox.ignoreLogs(['The method or property expo-font.unloadAsync is not available on android, are you sure you\'ve linked all the native dependencies properly?']);

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts(FONTS);
  const [volume, setVolume] = useState(0.5); // Trạng thái âm lượng mới

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <VolumeContext.Provider value={{ volume, setVolume }}> {/* Thêm VolumeContext.Provider */}
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Welcome'>
              <Stack.Screen name='Welcome' component={Welcome} />
              <Stack.Screen name='Login' component={Login} />
              <Stack.Screen name='Signup' component={Signup} />
              <Stack.Screen name='Home' component={Home} />
              <Stack.Screen name='User' component={User} />
              <Stack.Screen name='Shop' component={Shop} />
              <Stack.Screen name='Vip' component={Vip} />
              <Stack.Screen name='Setting' component={Setting}  />
              <Stack.Screen name='Leaderboard' component={Leaderboard} />
            </Stack.Navigator>
          </NavigationContainer>
        </VolumeContext.Provider> {/* Kết thúc VolumeContext.Provider */}
      </SafeAreaProvider>
    </Provider>
  );
}
