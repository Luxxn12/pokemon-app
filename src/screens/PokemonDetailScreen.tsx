import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";

type PokemonDetailRouteProp = RouteProp<RootStackParamList, "PokemonDetail">;

type Props = {
  route: PokemonDetailRouteProp;
};

type Pokemon = {
  id: number;
  name: string;
  types: Array<{ type: { name: string } }>;
  abilities?: Array<{ type: { name: string } }>;
  stats?: Array<{ type: { name: string } }>;
  sprites: { front_default: string };
};

const PokemonDetailScreen: React.FC<Props> = ({ route }) => {
  const { pokemon } = route.params as { pokemon: Pokemon };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{pokemon.name.toUpperCase()}</Text>
      <Image
        source={{ uri: pokemon.sprites.front_default }}
        style={styles.image}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipe:</Text>
        <View style={styles.types}>
          {pokemon.types.map((t: any) => (
            <Text key={t.type.name} style={styles.type}>
              {t.type.name}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        {pokemon.abilities && pokemon.abilities.length > 0 ? (
          <Text style={styles.sectionTitle}>Kemampuan:</Text>
        ) : null}
        <View style={styles.types}>
          {pokemon.abilities?.map((ab: any) => (
            <Text key={ab.ability.name} style={styles.detailText}>
              {ab.ability.name}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        {pokemon.abilities && pokemon.abilities.length > 0 ? (
          <Text style={styles.sectionTitle}>Statistik:</Text>
        ) : null}
        {pokemon.stats?.map((stat: any) => (
          <Text key={stat.stat.name} style={styles.detailStatistik}>
            {stat.stat.name}: {stat.base_stat}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default PokemonDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  section: {
    width: "100%",
    marginTop: 20,
  },
  sectionStatistik: {
    width: "50%",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  types: {
    flexDirection: "row",
  },
  type: {
    backgroundColor: "#f4511e",
    padding: 8,
    color: "white",
    borderRadius: 5,
    marginRight: 10,
    textTransform: "capitalize",
  },
  detailText: {
    fontSize: 16,
    borderColor: "#f4511e",
    borderWidth: 1,
    padding: 8,
    color: "#f4511e",
    borderRadius: 5,
    marginRight: 10,
    textTransform: "capitalize",
  },
  detailStatistik: {
    fontSize: 16,
    borderColor: "#f4511e",
    borderWidth: 1,
    padding: 8,
    color: "#f4511e",
    borderRadius: 5,
    marginRight: 10,
    textTransform: "capitalize",
    marginBottom: 10,
  },
});
