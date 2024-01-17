import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { Video } from 'expo-av';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import * as Font from 'expo-font';

const stages = [
  require('../assets/images/tree1.png'),
  require('../assets/images/tree2.png'),
  require('../assets/images/tree3.png'),
  require('../assets/images/tree4.png'),
  require('../assets/images/tree5.png'),
  require('../assets/images/tree6.png'),
  require('../assets/images/tree7.png'),
  require('../assets/images/tree8.png'),
  require('../assets/images/tree9.png'),
  require('../assets/images/tree10.png'),
];

const sizes = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550]; // Kích thước tương ứng cho mỗi giai đoạn
const positions = ['60%', '55%', '50%', '45%', '40%', '35%', '30%', '25%', '20%', '15%']; // Vị trí tương ứng cho mỗi giai đoạn

const Home = () => {
  const [treeStage, setTreeStage] = useState(0);
  const [treeSize, setTreeSize] = useState(sizes[0]);
  const [treePosition, setTreePosition] = useState(positions[0]);
  const [totalWatered, setTotalWatered] = useState(0); // Tổng số tiền đã tưới
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'AlegreyaSans-Black': require('../assets/fonts/AlegreyaSans-Black.ttf'),
      });
      setFontLoaded(true);
    }
    loadFont();
  }, []);

  const waterTree = () => {
    let waterAmount = treeStage === 0 ? 1 : 0.0001; // Số tiền tưới cho mỗi lần
    let newTotal = totalWatered + waterAmount;
    setTotalWatered(newTotal);

    if (newTotal >= treeStage + 1 && treeStage < stages.length - 1) {
      setTreeStage(treeStage + 1);
      setTreeSize(sizes[treeStage + 1]);
      setTreePosition(positions[treeStage + 1]);
    }
  };

  const barWidth = Dimensions.get('screen').width - 30;

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/videos/video.mp4')}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={styles.backgroundVideo}
      />
      <Image source={stages[treeStage]} style={{...styles.tree, width: treeSize, height: treeSize, top: treePosition}} resizeMode="contain" />
      <View style={styles.progressBarContainer}>
        <ProgressBarAnimated
          width={barWidth}
          value={(treeStage + 1) * 10}
          backgroundColorOnComplete="#6CC644"
          useNativeDriver={false}
        />
        {fontLoaded && <Text style={{...styles.moneyEarned, color: 'yellow'}}>💰 {totalWatered.toFixed(4)}</Text>}
      </View>
      <TouchableOpacity style={styles.buttonContainer} onPress={waterTree}>
        <Image source={require('../assets/images/water.png')} style={styles.waterImage} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  tree: {
    position: 'absolute',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 40, // Điều chỉnh giá trị này để di chuyển thanh tiến trình lên hoặc xuống
    alignItems: 'center',
  },
  moneyEarned: {
    fontFamily: 'AlegreyaSans-Black',
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  buttonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  waterImage: {
    width: 30,
    height: 30,
  },
});

export default Home;
