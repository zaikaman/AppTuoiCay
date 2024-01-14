import { View, Text, SafeAreaView,ScrollView } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import React from 'react'

export default function Home() {
  return (
    <SafeAreaView>
        <Stack.Screen 
            options = {{
                headerTitle : 'Ditmedpt',
            }}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{flex:1}}>
              <Text>dssssssf</Text>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}