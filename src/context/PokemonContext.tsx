import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Pokemon = {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprites: { front_default: string };
  abilities?: Array<{ type: { name: string } }>;
  stats?: Array<{ type: { name: string } }>;
};

type PokemonContextType = {
  customPokemon: Pokemon[];
  addPokemon: (pokemon: Omit<Pokemon, "id">) => Promise<void>;
  editPokemon: (
    id: number,
    updatedPokemon: Omit<Pokemon, "id">
  ) => Promise<void>;
  deletePokemon: (id: number) => Promise<void>;
  clearCustomPokemon: () => Promise<void>;
};

export const PokemonContext = createContext<PokemonContextType>({
  customPokemon: [],
  addPokemon: async () => {},
  editPokemon: async () => {},
  deletePokemon: async () => {},
  clearCustomPokemon: async () => {},
});

export const PokemonProvider = ({ children }: { children: ReactNode }) => {
  const [customPokemon, setCustomPokemon] = useState<Pokemon[]>([]);

  useEffect(() => {
    loadCustomPokemon();
  }, []);

  const loadCustomPokemon = async () => {
    try {
      const stored = await AsyncStorage.getItem("@custom_pokemon");
      const data: Pokemon[] = stored ? JSON.parse(stored) : [];
      setCustomPokemon(data);
    } catch (e) {
      console.error("Failed to load custom Pokémon:", e);
    }
  };

  const saveCustomPokemon = async (pokemonList: Pokemon[]) => {
    try {
      const validatedList = pokemonList.filter(
        (pokemon) =>
          pokemon.name &&
          pokemon.types &&
          Array.isArray(pokemon.types) &&
          pokemon.types.length > 0 &&
          pokemon.types[0].type &&
          pokemon.types[0].type.name &&
          pokemon.sprites &&
          pokemon.sprites.front_default
      );
      await AsyncStorage.setItem(
        "@custom_pokemon",
        JSON.stringify(validatedList)
      );
    } catch (e) {
      console.error("Failed to save custom Pokémon:", e);
    }
  };

  const addPokemon = async (pokemon: Omit<Pokemon, "id">) => {
    const newPokemon: Pokemon = {
      id: Date.now(),
      ...pokemon,
    };
    const updatedList = [...customPokemon, newPokemon];
    setCustomPokemon(updatedList);
    await saveCustomPokemon(updatedList);
  };

  const editPokemon = async (
    id: number,
    updatedPokemon: Omit<Pokemon, "id">
  ) => {
    const updatedList = customPokemon.map((p) =>
      p.id === id ? { id, ...updatedPokemon } : p
    );
    setCustomPokemon(updatedList);
    await saveCustomPokemon(updatedList);
  };

  const deletePokemon = async (id: number) => {
    const updatedList = customPokemon.filter((p) => p.id !== id);
    setCustomPokemon(updatedList);
    await saveCustomPokemon(updatedList);
  };

  const clearCustomPokemon = async () => {
    try {
      await AsyncStorage.removeItem("@custom_pokemon");
      setCustomPokemon([]);
    } catch (e) {
      console.error("Failed to clear custom Pokémon:", e);
    }
  };

  return (
    <PokemonContext.Provider
      value={{
        customPokemon,
        addPokemon,
        editPokemon,
        deletePokemon,
        clearCustomPokemon,
      }}
    >
      {children}
    </PokemonContext.Provider>
  );
};
