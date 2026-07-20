import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import type { RootStackParamList } from "./src/navigation";
import { getProfile } from "./src/lib/storage";
import BirthDataScreen from "./src/screens/BirthDataScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ChartScreen from "./src/screens/ChartScreen";
import GuideScreen from "./src/screens/GuideScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    getProfile().then((profile) => setInitialRoute(profile ? "Home" : "BirthData"));
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BirthData" component={BirthDataScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Chart"
          component={ChartScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: "Birth Chart",
            headerRight: () => (
              <Pressable onPress={() => navigation.navigate("Guide")} hitSlop={8}>
                <Text style={{ color: "#5b2a86", fontSize: 16, fontWeight: "600" }}>Guide</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen name="Guide" component={GuideScreen} options={{ headerShown: true, title: "Guide" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
