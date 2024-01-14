import { Stack } from 'expo-router'
import { useCallback } from 'react'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

function Layout() {
   return <Stack />
}

export default Layout