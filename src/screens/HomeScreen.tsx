import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { AuthContext } from "../context/AuthContext";
import { PokemonContext } from "../context/PokemonContext"; // Pastikan Anda memiliki gambar default
import Feather from "@expo/vector-icons/Feather";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type Pokemon = {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprites: { front_default: string };
  abilities?: Array<{ type: { name: string } }>;
  stats?: Array<{ type: { name: string } }>;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { customPokemon } = useContext(PokemonContext);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("All");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchPokemon();
  }, [customPokemon, filter]); 

  const fetchPokemon = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        "https://pokeapi.co/api/v2/pokemon?limit=50"
      );
      const results = response.data.results;

      const detailedPokemon = await Promise.all(
        results.map(async (pokemon: { name: string; url: string }) => {
          const res = await axios.get(pokemon.url);
          return res.data;
        })
      );

      // Gabungkan Pokémon dari API dengan customPokemon dari context
      const combinedPokemon = [...detailedPokemon, ...customPokemon];
      setPokemonList(combinedPokemon);
      setLoading(false);
      setFilteredPokemon(applyFilter(combinedPokemon, filter));
    } catch (e) {
      console.error("Error fetching Pokémon:", e);
      setError("Gagal mengambil data Pokémon.");
      setLoading(false);
    }
  };

  const handleFilter = (type: string) => {
    setFilter(type);
    setFilteredPokemon(applyFilter(pokemonList, type));
  };

  const applyFilter = (list: Pokemon[], type: string): Pokemon[] => {
    if (type === "All") {
      return list;
    }
    return list.filter((pokemon) =>
      pokemon.types.some(
        (t) => t.type.name.toLowerCase() === type.toLowerCase()
      )
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPokemon();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Pokemon }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate("PokemonDetail", { pokemon: item })}
    >
      {item.sprites && item.sprites.front_default ? (
        <Image
          source={{ uri: item.sprites.front_default }}
          style={styles.pokemonImage}
        />
      ) : (
        <Image
          source={{ uri: "https://i.pravatar.cc/200?img=4" }}
          style={styles.pokemonImage}
        />
      )}
      <Text style={styles.itemText}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
        <TouchableOpacity onPress={fetchPokemon} style={styles.retryButton}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={filter}
        style={styles.picker}
        onValueChange={(itemValue) => handleFilter(itemValue)}
      >
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Air" value="water" />
        <Picker.Item label="Listrik" value="electric" />
      </Picker>
      <FlatList
        data={filteredPokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <View style={styles.footer}>
        {user?.role === "admin" ? (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate("Admin")}
          >
            <Feather name="user" size={24} color="black" />
            <Text style={styles.adminText}>Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate("user")}
          >
            <Feather name="user" size={24} color="black" />
            <Text style={styles.adminText}>Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={24} color="black" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#ffffff",
  },
  list: {
    padding: 10,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  pokemonImage: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  itemText: {
    fontSize: 18,
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#ffffff",
    borderTopColor: "#e0e0e0",
    borderTopWidth: 1,
  },
  adminButton: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  adminText: {
    color: "#000000",
    justifyContent: "center",
  },
  logoutButton: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  logoutText: {
    color: "#000000",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
