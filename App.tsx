import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import { PokemonProvider } from "./src/context/PokemonContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { Provider as PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <AuthProvider>
      <PokemonProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </PokemonProvider>
    </AuthProvider>
  );
}
