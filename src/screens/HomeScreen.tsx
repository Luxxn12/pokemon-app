// src/screens/HomeScreen.tsx
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

type Pokemon = {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprites: { front_default: string };
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('All');
  const [customPokemon, setCustomPokemon] = useState<Pokemon[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false); // State untuk pull-to-refresh

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100');
      const results = response.data.results;

      const detailedPokemon = await Promise.all(
        results.map(async (pokemon: { name: string; url: string }) => {
          const res = await axios.get(pokemon.url);
          return res.data;
        })
      );

      // Load custom Pokemon dari AsyncStorage
      const storedCustom = await AsyncStorage.getItem('@custom_pokemon');
      const custom = storedCustom ? JSON.parse(storedCustom) : [];

      setCustomPokemon(custom);
      const combinedPokemon = [...detailedPokemon, ...custom];
      setPokemonList(combinedPokemon);
      setFilteredPokemon(applyFilter(combinedPokemon, filter));
      setLoading(false);
    } catch (e) {
      setError('Gagal mengambil data Pokémon.');
      setLoading(false);
    }
  };

  const loadCustomPokemon = async () => {
    try {
      const storedCustom = await AsyncStorage.getItem('@custom_pokemon');
      if (storedCustom) {
        setCustomPokemon(JSON.parse(storedCustom));
      }
    } catch (e) {
      console.error('Failed to load custom Pokemon.');
    }
  };

  const handleFilter = (type: string) => {
    setFilter(type);
    setFilteredPokemon(applyFilter(pokemonList, type));
  };

  const applyFilter = (list: Pokemon[], type: string): Pokemon[] => {
    if (type === 'All') {
      return list;
    }
    return list.filter((pokemon) =>
      pokemon.types.some((t) => t.type.name.toLowerCase() === type.toLowerCase())
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
      onPress={() => navigation.navigate('PokemonDetail', { pokemon: item })}
    >
      <Image source={{ uri: item.sprites.front_default }} style={styles.pokemonImage} />
      <Text style={styles.itemText}>{item.name.toUpperCase()}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    // Menampilkan spinner hanya saat loading awal, bukan saat pull-to-refresh
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

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
      {/* Filter Picker */}
      <Picker selectedValue={filter} style={styles.picker} onValueChange={(itemValue) => handleFilter(itemValue)}>
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Air" value="water" />
        <Picker.Item label="Listrik" value="electric" />
        {/* Tambahkan tipe lain sesuai kebutuhan */}
      </Picker>

      {/* Daftar Pokémon dengan Pull-to-Refresh */}
      <FlatList
        data={filteredPokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Tombol Admin/Profile dan Logout */}
      <View style={styles.footer}>
        {user?.role === 'admin' ? (
          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Admin')}>
            <Text style={styles.adminText}>Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.adminText}>Profile</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
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
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  list: {
    padding: 10,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pokemonImage: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  itemText: {
    fontSize: 18,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  adminButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
  },
  adminText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
