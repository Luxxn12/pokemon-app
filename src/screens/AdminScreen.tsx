// src/screens/AdminScreen.tsx
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

type Pokemon = {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprites: { front_default: string };
};

const AdminScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [customPokemon, setCustomPokemon] = useState<Pokemon[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
  const [form, setForm] = useState<{ name: string; type: string; image: string }>({
    name: '',
    type: '',
    image: '',
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCustomPokemon();
  }, []);

  const loadCustomPokemon = async () => {
    try {
      const stored = await AsyncStorage.getItem('@custom_pokemon');
      const data = stored ? JSON.parse(stored) : [];
      setCustomPokemon(data);
    } catch (e) {
      console.error('Failed to load custom Pokemon.');
    }
  };

  const saveCustomPokemon = async (pokemonList: Pokemon[]) => {
    try {
      await AsyncStorage.setItem('@custom_pokemon', JSON.stringify(pokemonList));
    } catch (e) {
      console.error('Failed to save custom Pokemon.');
    }
  };

  const handleAdd = () => {
    setEditingPokemon(null);
    setForm({ name: '', type: '', image: '' });
    setModalVisible(true);
  };

  const handleEdit = (pokemon: Pokemon) => {
    setEditingPokemon(pokemon);
    setForm({
      name: pokemon.name,
      type: pokemon.types[0]?.type.name || '',
      image: pokemon.sprites.front_default || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin menghapus Pokémon ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const updated = customPokemon.filter((p) => p.id !== id);
          setCustomPokemon(updated);
          await saveCustomPokemon(updated);
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.image) {
      Alert.alert('Error', 'Semua bidang harus diisi.');
      return;
    }

    setLoading(true);
    let updated: Pokemon[] = [];

    if (editingPokemon) {
      updated = customPokemon.map((p) =>
        p.id === editingPokemon.id
          ? {
              ...p,
              name: form.name,
              types: [{ type: { name: form.type } }],
              sprites: { front_default: form.image },
            }
          : p
      );
    } else {
      const newPokemon: Pokemon = {
        id: Date.now(),
        name: form.name,
        types: [{ type: { name: form.type } }],
        sprites: { front_default: form.image },
      };
      updated = [...customPokemon, newPokemon];
    }

    setCustomPokemon(updated);
    await saveCustomPokemon(updated);
    setLoading(false);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name.toUpperCase()}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {user?.role === 'admin' ? (
        <>
          {/* Profil dan Nama Role */}
          <View style={styles.profileContainer}>
            {/* Anda dapat menambahkan gambar profil jika tersedia */}
            <Image source={{ uri: 'https://i.pravatar.cc/200?img=4' }} style={styles.profileImage} />
            <View>
              <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
              <Text style={styles.roleText}>Role: {user.role.toUpperCase()}</Text>
            </View>
          </View>

          {/* Tombol Tambah Pokémon */}
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>Tambah Pokémon</Text>
          </TouchableOpacity>

          {/* Daftar Pokémon */}
          <FlatList
            data={customPokemon}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada Pokémon khusus.</Text>}
            contentContainerStyle={styles.list}
          />

          {/* Modal untuk Tambah/Edit */}
          <Modal visible={modalVisible} animationType="slide">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{editingPokemon ? 'Edit Pokémon' : 'Tambah Pokémon'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Nama"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Tipe"
                value={form.type}
                onChangeText={(text) => setForm({ ...form, type: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="URL Gambar"
                value={form.image}
                onChangeText={(text) => setForm({ ...form, image: text })}
              />
              {loading ? (
                <ActivityIndicator size="large" color="#1e90ff" />
              ) : (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitText}>{editingPokemon ? 'Update' : 'Tambah'}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.emptyText}>Anda bukan admin.</Text>
      )}
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#32cd32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
  },
  buttons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
