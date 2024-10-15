import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import PokemonDetailScreen from "../screens/PokemonDetailScreen";
import AdminScreen from "../screens/AdminScreen";
import { AuthContext } from "../context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  PokemonDetail: { pokemon: any };
  Admin: undefined;
  user: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#f4511e",
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Pokémon App" }}/>
            <Stack.Screen
              name="PokemonDetail"
              component={PokemonDetailScreen}
              options={{ title: "Detail Pokémon" }}
            />
            {user.role === "admin" && (
              <Stack.Screen
                name="Admin"
                component={AdminScreen}
                options={{ title: "Profile" }}
              />
            )}
            {user.role === "user" && (
              <Stack.Screen
                name="user"
                component={AdminScreen}
                options={{ title: "Profile" }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
