import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Alert, Platform, Dimensions } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 414;

export default function HomeScreen({ navigation }: Props) {
  const handleQuit = () => {
    Alert.alert(
      "Oyundan çıkmak",
      "Oyundan çıkmak istediğinize emin misiniz?",
      [
        {
          text: "Hayır",
          style: "cancel"
        },
        {
          text: "Evet",
          onPress: () => BackHandler.exitApp()
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Doğru Yaz Oyunu</Text>
      </View>
      
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Categories')}
        >
          <Text style={styles.buttonText}>Oyna</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Score')}
        >
          <Text style={styles.buttonText}>Skorlar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.quitButton]} 
          onPress={handleQuit}
        >
          <Text style={styles.buttonText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
    paddingTop: Platform.OS === 'ios' ? height * 0.12 : height * 0.1,
    backgroundColor: '#4CAF50',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: isSmallDevice ? 24 : isLargeDevice ? 32 : 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 25,
    marginVertical: height * 0.015,
    width: width * 0.8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quitButton: {
    backgroundColor: '#FF3B30',
    marginTop: height * 0.03,
  },
  buttonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 16 : isLargeDevice ? 20 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 