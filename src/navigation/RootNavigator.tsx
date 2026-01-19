import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import LoaderScreen from '../screens/LoaderScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loader"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: {backgroundColor: 'transparent'},
      }}>
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Tabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}
