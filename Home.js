import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, Alert } from 'react-native';
import { Video } from 'expo-av';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import * as Font from 'expo-font';
import { getUserData, updateUserData } from '../utils/actions/userActions';
import { getAuth } from 'firebase/auth';
import { Audio } from 'expo-av';

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

const sizes = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550];
const positions = ['60%', '55%', '50%', '45%', '40%', '35%', '30%', '25%', '20%', '15%'];

const Home = ({ navigation }) => {
  const [treeStage, setTreeStage] = useState(0);
  const [treeSize, setTreeSize] = useState(sizes[0]);
  const [treePosition, setTreePosition] = useState(positions[0]);
  const [totalWatered, setTotalWatered] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [remainingWaterTimes, setRemainingWaterTimes] = useState(10000);
  const auth = getAuth();

  useEffect(() => {
    const playMusic = async () => {
      const sound = new Audio.Sound();
      try {
        await sound.loadAsync(require('../assets/music/music.mp3'));
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
      } catch (error) {
        console.log(error);
      }
    };

    playMusic();

    return async () => {
      // Clean up the audio when the component unmounts
      const sound = new Audio.Sound();
      await sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData(auth.currentUser.uid);
      setTreeStage(userData.treeStage);
      setTotalWatered(userData.totalWatered);
      setRemainingWaterTimes(userData.remainingWaterTimes || 10000);
      setTreeSize(userData.treeSize || sizes[0]);
      setTreePosition(userData.treePosition || positions[0]);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    updateUserData(auth.currentUser.uid, {
      treeStage,
      totalWatered,
      treeSize,
      treePosition,
    });
  }, [treeStage, totalWatered, treeSize, treePosition]);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'AlegreyaSans-Black': require('../assets/fonts/AlegreyaSans-Black.ttf'),
      });
      setFontLoaded(true);
    }

    loadFont();

    return () => {
      // Clean up the font when the component unmounts
      Font.unloadAsync('AlegreyaSans-Black');
    };
  }, []);

  const waterTree = () => {
    if (remainingWaterTimes > 0) {
      let waterAmount = treeStage === 0 ? 1 : 0.1;
      let newTotal = totalWatered + waterAmount;
      setTotalWatered(newTotal);

      if (newTotal >= treeStage + 1 && treeStage < stages.length - 1) {
        let newTreeStage = treeStage + 1;
        setTreeStage(newTreeStage);
        setTreeSize(sizes[newTreeStage]);
        setTreePosition(positions[newTreeStage]);
      }

      setRemainingWaterTimes(remainingWaterTimes - 1);
      updateUserData(auth.currentUser.uid, {
        remainingWaterTimes: remainingWaterTimes - 1,
      });
    }
  };

  const signOutAlert = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  const vipButtonAlert = () => {
    Alert.alert(
      "VIP Button",
      "You have clicked the VIP button",
      [
        {
          text: "OK",
          onPress: () => console.log("OK Pressed"),
          style: "cancel"
        }
      ]
    );
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
      <Image
        source={stages[treeStage]}
        style={{ ...styles.tree, width: treeSize, height: treeSize, top: treePosition }}
        resizeMode="contain"
      />
      <View style={styles.progressBarContainer}>
        <ProgressBarAnimated
          width={barWidth}
          value={(treeStage + 1) * 10}
          backgroundColorOnComplete="#6CC644"
          useNativeDriver={false}
        />
        {fontLoaded && <Text style={{ ...styles.moneyEarned, color: 'yellow' }}>💰 {(totalWatered || 0).toFixed(4)}</Text>}
      </View>
      <View style={styles.remainingContainer}>
        {fontLoaded && <Text style={{ ...styles.remainingText, color: 'yellow' }}>💧 {remainingWaterTimes}</Text>}
      </View>
      <TouchableOpacity style={styles.buttonContainer} onPress={waterTree}>
        <Image source={require('../assets/images/water.png')} style={styles.waterImage} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={signOutAlert}>
        <Image source={require('../assets/images/back.png')} style={styles.signOutImage} />
      </TouchableOpacity>
      <TouchableOpacity onPress={vipButtonAlert}>
        <Image source={require('../assets/images/vip.png')} style={styles.vipButton} />
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
  remainingContainer: {
    position: 'absolute',
    right: 25,
    bottom: 90,
  },
  remainingText: {
    fontFamily: 'AlegreyaSans-Black',
    fontSize: 16,
  },
  tree: {
    position: 'absolute',
  },
  progressBarContainer: {
    position: 'absolute',
    top: 40,
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
    backgroundColor: '#abb94d',
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
  signOutButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#a29182',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
    right: 290,
  },
  signOutImage: {
    width: 30,
    height: 30,
  },
  vipButton: {
    width: 80, 
    height: 80, 
    top : -310,
    right : -145
  }  
});

export default Home;
