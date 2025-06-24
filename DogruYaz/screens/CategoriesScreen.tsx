import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../components/BackButton';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const categories = [
  {
    id: 'spelling',
    title: 'En çok yazım yanlışı yapılan kelimeler',
    description: 'Türkçede sıkça yanlış yazılan kelimeleri öğrenin'
  },
  {
    id: 'vocabulary',
    title: 'Kelime bilgisi',
    description: 'Kelime haznenizi geliştirin'
  },
  {
    id: 'general',
    title: 'En çok yanlış bilinen genel kültür soruları',
    description: 'Genel kültür bilginizi test edin'
  },
  {
    id: 'history',
    title: 'Tarih hakkında en çok bilinen yanlışlar',
    description: 'Tarihi doğru öğrenin'
  }
];

export default function CategoriesScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>Kategoriler</Text>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Game', { category: category.id })}
          >
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 15,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 