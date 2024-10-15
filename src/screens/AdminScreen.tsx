import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { PokemonContext } from "../context/PokemonContext";
import { AuthContext } from "../context/AuthContext";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Pokemon = {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  sprites: { front_default: string };
};

const AdminScreen = () => {
  const { user } = useContext(AuthContext);
  const { customPokemon, addPokemon, editPokemon, deletePokemon } =
    useContext(PokemonContext);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: string;
    image: string;
  }>({
    name: "",
    type: "",
    image: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleAdd = () => {
    setEditingPokemon(null);
    setForm({ name: "", type: "", image: "" });
    setModalVisible(true);
  };

  const handleEdit = (pokemon: Pokemon) => {
    setEditingPokemon(pokemon);
    setForm({
      name: pokemon.name,
      type: pokemon.types[0]?.type.name || "",
      image: pokemon.sprites.front_default || "",
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus Pokémon ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await deletePokemon(id);
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type || !form.image) {
      Toast.show({
        type: "error",
        text1: `${editingPokemon ? "Edit Gagal" : "Tambah Gagal"}`,
        text2: "Lengkapi Semua Form",
      });
      return;
    }

    setLoading(true);

    const pokemonData: Omit<Pokemon, "id"> = {
      name: form.name,
      types: [{ type: { name: form.type.toLowerCase() } }],
      sprites: { front_default: form.image },
    };

    if (editingPokemon) {
      await editPokemon(editingPokemon.id, pokemonData);
    } else {
      await addPokemon(pokemonData);
    }

    setLoading(false);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Pokemon }) => (
    <View style={styles.itemContainer}>
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
      <View style={styles.itemInfo}>
        <Text style={styles.itemText}>{item.name.toUpperCase()}</Text>
        {item.types && item.types.length > 0 ? (
          <Text style={styles.itemSubText}>
            Type: {item.types.map((t) => t.type.name).join(", ")}
          </Text>
        ) : (
          <Text style={styles.itemSubText}>Type: -</Text>
        )}
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <MaterialIcons name="mode-edit" size={24} color="#1f1f97" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <MaterialIcons name="delete-outline" size={24} color="#c11818" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user || user.role !== "admin") {
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/200?img=10" }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
            <Text style={styles.roleText}>
              Role: {user?.role.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          zIndex: 9999,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontWeight: "400",
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          zIndex: 9999,
          borderLeftColor: "red",
        }}
        text1Style={{
          fontSize: 17,
        }}
        text2Style={{
          fontSize: 15,
        }}
      />
    ),
    tomatoToast: ({ text1, props }: any) => (
      <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
        <Text>{text1}</Text>
        <Text>{props.uuid}</Text>
      </View>
    ),
  };

  return (
    <View style={styles.container}>
      {user.role === "admin" && (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/200?img=4" }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
            <Text style={styles.roleText}>Role: {user.role.toUpperCase()}</Text>
          </View>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addText}>Tambah Pokémon</Text>
      </TouchableOpacity>
      <FlatList
        data={customPokemon}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada Pokémon khusus.</Text>
        }
        contentContainerStyle={styles.list}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            {editingPokemon ? "Edit Pokémon" : "Tambah Pokémon"}
          </Text>
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
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>
                {editingPokemon ? "Update" : "Tambah"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeText}>Tutup</Text>
          </TouchableOpacity>
        </View>
        <Toast config={toastConfig} />
      </Modal>
    </View>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  roleText: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#f4511e",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  listData: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  addText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  pokemonImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    textTransform: "capitalize",
  },
  itemSubText: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  buttons: {
    flexDirection: "row",
  },
  editButton: {
    // backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    // backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    backgroundColor: "#f0f0f0",
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  submitText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#ff6347",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
