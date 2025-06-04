import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StatusBar } from 'react-native';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import AuthScreen from './src/screens/auth/AuthScreen';
import Login from './src/screens/auth/login';
import SignUp from "./src/screens/auth/signup";
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
// import Main from "./component/main";
// import Home from "./component/Home";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Stays" 
        component={PlaceholderScreen} 
      />
      <Tab.Screen 
        name="Vehicles" 
        component={PlaceholderScreen}
      />
      <Tab.Screen 
        name="Explore" 
        component={PlaceholderScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={PlaceholderScreen}
      />
    </Tab.Navigator>
  );
}

// if you want to add a new screen,temporary placeholder screen
function PlaceholderScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Coming Soon!</Text>
    </View>
  );
}

export default function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
  };

  return (
    <SafeAreaProvider>
      
      <NavigationContainer>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#FFFFFF'
            }
          }}
        >
          {!hasSeenOnboarding ? (
            // Onboarding Stack
            <Stack.Screen 
              name="Onboarding" 
              component={OnboardingScreen}
              initialParams={{ onComplete: handleOnboardingComplete }}
            />
          ) : !isAuthenticated ? (
            <>
              <Stack.Screen 
                name="Login" 
                component={Login}
                initialParams={{ setIsAuthenticated }}
              />
              <Stack.Screen 
                name="Signup" 
                component={SignUp}
                initialParams={{ setIsAuthenticated }}
              />
            </>
          ) : (
            <Stack.Screen 
              name="MainTabs" 
              component={BottomTabNavigator}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}