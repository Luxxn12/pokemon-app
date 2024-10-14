// src/screens/PokemonDetailScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type PokemonDetailScreenRouteProp = RouteProp<RootStackParamList, 'PokemonDetail'>;

type Props = {
  route: PokemonDetailScreenRouteProp;
};

const PokemonDetailScreen: React.FC<Props> = ({ route }) => {
  const { pokemon } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{pokemon.name.toUpperCase()}</Text>
      <Image source={{ uri: pokemon.sprites.front_default }} style={styles.image} />
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
        <Text style={styles.sectionTitle}>Kemampuan:</Text>
        {pokemon.abilities.map((ab: any) => (
          <Text key={ab.ability.name} style={styles.detailText}>
            {ab.ability.name}
          </Text>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistik:</Text>
        {pokemon.stats.map((stat: any) => (
          <Text key={stat.stat.name} style={styles.detailText}>
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
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
  },
  section: {
    width: '100%',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  types: {
    flexDirection: 'row',
  },
  type: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 20,
    marginRight: 10,
    textTransform: 'capitalize',
  },
  detailText: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
});
