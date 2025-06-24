import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import questions from '../data/questions.json';
import BackButton from '../components/BackButton';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

type Question = {
  id: number;
  question: string;
  answer: boolean;
  explanation: string;
};

type Questions = {
  [key: string]: Question[];
};

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 414;

export default function GameScreen({ navigation, route }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultsAnimation] = useState(new Animated.Value(0));
  const category = route.params?.category || 'spelling';
  
  // Soruları karıştır
  const [shuffledQuestions] = useState(() => {
    const categoryQuestions = questions[category as keyof typeof questions];
    return [...categoryQuestions].sort(() => Math.random() - 0.5);
  });

  // Her kategoriden 10 soru seç
  const currentQuestions = shuffledQuestions.slice(0, 10);
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Animasyon değerleri
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);
  const shakeAnim = new Animated.Value(0);

  const animateCorrect = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateWrong = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const saveScore = async () => {
    try {
      // Mevcut skorları al
      const scoresStr = await AsyncStorage.getItem('gameScores');
      let scores = scoresStr ? JSON.parse(scoresStr) : [];

      // Yeni skoru ekle
      const newScore = {
        date: new Date().toISOString().split('T')[0],
        category: category,
        score: score,
        total: currentQuestions.length,
        timestamp: new Date().getTime()
      };

      scores.push(newScore);

      // Son 10 skoru tut (her kategori için)
      scores = scores
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .reduce((acc: any[], curr: any) => {
          const categoryScores = acc.filter(s => s.category === curr.category);
          if (categoryScores.length < 10) {
            acc.push(curr);
          }
          return acc;
        }, []);

      // Skorları kaydet
      await AsyncStorage.setItem('gameScores', JSON.stringify(scores));
    } catch (error) {
      console.error('Skor kaydedilemedi:', error);
    }
  };

  const handleAnswer = (userAnswer: boolean) => {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const isCorrect = category === 'spelling' 
  ? userAnswer === currentQuestion.correctOption
  : userAnswer === currentQuestion.answer;

    if (isCorrect) {
      setScore(score + 1);
      animateCorrect();
    } else {
      animateWrong();
    }
    setLastAnswerCorrect(isCorrect);
    setShowExplanation(true);
  };

  const showResultsScreen = () => {
    setShowResults(true);
    Animated.spring(resultsAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
      setLastAnswerCorrect(null);
    } else {
      await saveScore();
      showResultsScreen();
    }
  };

  const categoryNames: { [key: string]: string } = {
    spelling: 'Yazım',
    vocabulary: 'Kelime Bilgisi',
    general: 'Genel Kültür',
    history: 'Tarih'
  };

  if (showResults) {
    const percentage = Math.round((score / currentQuestions.length) * 100);

    return (
      <View style={styles.container}>
        <BackButton />
        <Animated.View 
          style={[
            styles.resultsContainer,
            {
              transform: [
                {
                  translateY: resultsAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.resultsContent}>
            <Text style={styles.congratsText}>Tebrikler!</Text>
            <Text style={styles.categoryText}>{categoryNames[category]}</Text>
            
            <View style={styles.scoreCircle}>
              <Text style={styles.percentageText}>{percentage}%</Text>
              <Text style={styles.scoreText}>
                {score}/{currentQuestions.length}
              </Text>
            </View>

            <Text style={styles.resultMessage}>
              {percentage >= 80 ? 'Mükemmel! Harika bir performans!' :
               percentage >= 60 ? 'İyi iş çıkardın!' :
               'Biraz daha pratik yapmalısın.'}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.resultButton, styles.scoreButton]}
                onPress={() => navigation.navigate('Score')}
              >
                <Text style={styles.buttonText}>Skorlar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resultButton, styles.homeButton]}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.buttonText}>Ana Sayfa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <Text style={styles.questionCounter}>Soru: {currentQuestionIndex + 1}/{currentQuestions.length}</Text>
        <Text style={styles.score}>Skor: {score}</Text>
      </View>

      <Animated.View style={[
        styles.questionContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: shakeAnim }
          ],
          opacity: fadeAnim,
        }
      ]}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {showExplanation && (
          <View style={styles.resultContainer}>
            <Text style={[styles.resultIcon, lastAnswerCorrect ? styles.correctIcon : styles.wrongIcon]}>
              {lastAnswerCorrect ? '✓' : '✗'}
            </Text>
            <Text style={[styles.resultText, lastAnswerCorrect ? styles.correctText : styles.wrongText]}>
              {lastAnswerCorrect ? 'Doğru Cevap!' : 'Yanlış Cevap!'}
            </Text>
          </View>
        )}

{!showExplanation ? (
  <View style={styles.buttonContainer}>
    {category === 'spelling' ? (
      <>
        <TouchableOpacity
          style={[styles.answerButton, styles.trueButton]}
          onPress={() => handleAnswer(1)}
        >
          <Text style={styles.buttonText}>{currentQuestion.option1}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.answerButton, styles.falseButton]}
          onPress={() => handleAnswer(2)}
        >
          <Text style={styles.buttonText}>{currentQuestion.option2}</Text>
        </TouchableOpacity>
      </>
    ) : (
      <>
        <TouchableOpacity
          style={[styles.answerButton, styles.trueButton]}
          onPress={() => handleAnswer(true)}
        >
          <Text style={styles.buttonText}>Doğru</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.answerButton, styles.falseButton]}
          onPress={() => handleAnswer(false)}
        >
          <Text style={styles.buttonText}>Yanlış</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
) : (

          <View style={styles.explanationContainer}>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={nextQuestion}
            >
              <Text style={styles.buttonText}>Sonraki Soru</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
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
  questionCounter: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  score: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    width: width * 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  questionContainer: {
    flex: 1,
    padding: width * 0.05,
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: width * 0.05,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: height * 0.05,
    lineHeight: isSmallDevice ? 28 : 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.03,
  },
  answerButton: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: width * 0.4,
  },
  trueButton: {
    backgroundColor: '#4CAF50',
  },
  falseButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  explanationContainer: {
    alignItems: 'center',
    marginTop: height * 0.03,
    backgroundColor: '#f8f8f8',
    padding: width * 0.05,
    borderRadius: 15,
  },
  explanationText: {
    fontSize: isSmallDevice ? 16 : 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: height * 0.02,
    lineHeight: isSmallDevice ? 22 : 24,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.1,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: '100%',
  },
  resultContainer: {
    alignItems: 'center',
    marginVertical: height * 0.02,
  },
  resultIcon: {
    fontSize: isSmallDevice ? 40 : 48,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
  },
  resultText: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: 'bold',
  },
  correctIcon: {
    color: '#4CAF50',
  },
  wrongIcon: {
    color: '#f44336',
  },
  correctText: {
    color: '#4CAF50',
  },
  wrongText: {
    color: '#f44336',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: width * 0.05,
  },
  resultsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: height * 0.05,
  },
  congratsText: {
    fontSize: isSmallDevice ? 28 : isLargeDevice ? 36 : 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.01,
  },
  categoryText: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    color: '#666',
    marginBottom: height * 0.04,
  },
  scoreCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.04,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  percentageText: {
    fontSize: isSmallDevice ? 40 : isLargeDevice ? 56 : 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.005,
  },
  scoreText: {
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    color: '#fff',
    opacity: 0.9,
  },
  resultMessage: {
    fontSize: isSmallDevice ? 18 : 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: height * 0.04,
    paddingHorizontal: width * 0.05,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  resultButton: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.08,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: width * 0.35,
  },
  scoreButton: {
    backgroundColor: '#4CAF50',
    marginRight: width * 0.02,
  },
  homeButton: {
    backgroundColor: '#007AFF',
    marginLeft: width * 0.02,
  },
}); 