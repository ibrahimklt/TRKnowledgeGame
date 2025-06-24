import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackButton from '../components/BackButton';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type Score = {
  date: string;
  category: string;
  score: number;
  total: number;
  timestamp: number;
};

type CategoryScores = {
  [key: string]: Score[];
};

const categoryNames: { [key: string]: string } = {
  spelling: 'Yazım',
  vocabulary: 'Kelime Bilgisi',
  general: 'Genel Kültür',
  history: 'Tarih'
};

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width >= 428;

export default function ScoreScreen({ navigation }: Props) {
  const [categoryScores, setCategoryScores] = useState<CategoryScores>({});
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      const scoresStr = await AsyncStorage.getItem('gameScores');
      if (scoresStr) {
        const scores: Score[] = JSON.parse(scoresStr);
        
        // Skorları kategorilere göre grupla
        const grouped = scores.reduce((acc: CategoryScores, score) => {
          if (!acc[score.category]) {
            acc[score.category] = [];
          }
          acc[score.category].push(score);
          return acc;
        }, {});

        // Her kategori için skorları tarihe göre sırala
        Object.keys(grouped).forEach(category => {
          grouped[category].sort((a, b) => b.timestamp - a.timestamp);
        });

        setCategoryScores(grouped);
      }
    } catch (error) {
      console.error('Skorlar yüklenemedi:', error);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    try {
      await AsyncStorage.removeItem('gameScores');
      setCategoryScores({});
      setShowResetModal(false);
    } catch (error) {
      console.error('Skorlar silinemedi:', error);
    }
  };

  const calculateAverageScore = (scores: Score[]): number => {
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + (score.score / score.total) * 100, 0);
    return Math.round(total / scores.length);
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.title}>Skorlar</Text>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {Object.keys(categoryScores).length > 0 ? (
          Object.entries(categoryScores).map(([category, scores]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{categoryNames[category]}</Text>
                <Text style={[
                  styles.averageScore,
                  calculateAverageScore(scores) >= 70 ? styles.goodScore :
                  calculateAverageScore(scores) >= 50 ? styles.mediumScore :
                  styles.badScore
                ]}>
                  Ortalama: %{calculateAverageScore(scores)}
                </Text>
              </View>
              {scores.map((score, index) => (
                <View key={index} style={styles.scoreCard}>
                  <Text style={styles.date}>{score.date}</Text>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreText}>
                      {score.score}/{score.total}
                    </Text>
                    <Text style={[
                      styles.percentage,
                      (score.score / score.total) * 100 >= 70 ? styles.goodScore :
                      (score.score / score.total) * 100 >= 50 ? styles.mediumScore :
                      styles.badScore
                    ]}>
                      %{Math.round((score.score / score.total) * 100)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz skor kaydedilmemiş</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Skorları Sıfırla</Text>
            <Text style={styles.modalText}>Tüm skorlar silinecek. Emin misiniz?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowResetModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={confirmReset}
              >
                <Text style={styles.confirmButtonText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  headerLeft: {
    width: width * 0.1,
  },
  title: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  averageScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  percentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  goodScore: {
    color: '#4CAF50',
  },
  mediumScore: {
    color: '#FFA000',
  },
  badScore: {
    color: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#fff',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 20,
    width: width * 0.2,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    width: width * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  modalText: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.02,
  },
  modalButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 25,
    minWidth: width * 0.3,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 