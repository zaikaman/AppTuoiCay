import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { FONTS } from './constants/fonts';
import React, { useState, useCallback, useEffect } from 'react'; // Add useState here
import { Login, Signup, Welcome, Home, User, Vip, Shop, Leaderboard, Setting, Spin} from './screens';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ShopContext } from './screens/ShopContext';

LogBox.ignoreLogs(['Warning: Failed prop type: Invalid prop `source` supplied to `Image`, expected one of type [number].']);
LogBox.ignoreLogs(['Animated: `useNativeDriver` was not specified.']);
LogBox.ignoreLogs(['ViewPropTypes has been removed from React Native.']);
LogBox.ignoreLogs(['componentWillReceiveProps has been renamed, and is not recommended for use.']);
LogBox.ignoreLogs(['The method or property expo-font.unloadAsync is not available on android, are you sure you\'ve linked all the native dependencies properly?']);
LogBox.ignoreLogs(['`flexWrap: `wrap`` is not supported with the `VirtualizedList` components']);

const Stack = createNativeStackNavigator();

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [fontsLoaded] = useFonts(FONTS);

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
        <GestureHandlerRootView style={{flex: 1}}>
          <NavigationContainer>
            <ShopContext.Provider value={{ selectedItem, setSelectedItem }}> 
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Welcome'>
                <Stack.Screen name='Welcome' component={Welcome} />
                <Stack.Screen name='Login' component={Login} />
                <Stack.Screen name='Signup' component={Signup} />
                <Stack.Screen name='Home' component={Home} />
                <Stack.Screen name='User' component={User} />
                <Stack.Screen name='Shop' component={Shop} />
                <Stack.Screen name='Vip' component={Vip} />
                <Stack.Screen name='Setting' component={Setting} />
                <Stack.Screen name='Spin' component={Spin} />
                <Stack.Screen name='Leaderboard' component={Leaderboard} />
              </Stack.Navigator>
            </ShopContext.Provider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}
