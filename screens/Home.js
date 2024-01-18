
import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, Alert } from 'react-native';
import { Video } from 'expo-av';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import * as Font from 'expo-font';
import { getUserData, updateUserData } from '../utils/actions/userActions';
import { getAuth } from 'firebase/auth';
import { Audio } from 'expo-av';
import { Modal } from 'react-native';
import sound from './sound';

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

// Get the screen dimensions
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

// Calculate the position of the buttons
const signOutButtonPosition = {
  top: screenHeight * 0.08, // 1% from the top of the screen
  left: screenWidth * 0.78, // 1% from the left of the screen
};

const vipButtonPosition = {
  top: screenHeight * 0.22, // 20% from the top of the screen
  right: screenWidth * 0.247, // 10% from the right of the screen
};

const Home = ({ navigation }) => {
  const [treeStage, setTreeStage] = useState(0);
  const [treeSize, setTreeSize] = useState(sizes[0]);
  const [treePosition, setTreePosition] = useState(positions[0]);
  const [totalWatered, setTotalWatered] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [remainingWaterTimes, setRemainingWaterTimes] = useState(10000);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const playMusic = async () => {
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

  const barWidth = Dimensions.get('screen').width - 30;

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
      <TouchableOpacity style = {styles.menuButton} onPress={() => {setModalVisible(true)}}>
        <Image source={require('../assets/images/menu.png')} style = {styles.waterImage} />
      </TouchableOpacity>
      <TouchableOpacity onPress={vipButtonAlert}>
        <Image source={require('../assets/images/vip.png')} style={styles.vipButton} />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modal}>
        <TouchableOpacity
        style = {
          styles.closeModal
        }
              onPress={() => {
                setModalVisible(false);
              }}>
              <Text style = {{
                fontSize : 25,
                marginLeft : 10,
                marginTop : 3,
              }}>x</Text>
            </TouchableOpacity>
          <View style={styles.modalContent}>
    
            <TouchableOpacity style={styles.modal_textContainer} onPress={() => {navigation.navigate('User'); setModalVisible(false)} }>
              <Text style={styles.modal_text}>Your Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modal_textContainer} onPress={() => {navigation.navigate('Vip'); setModalVisible(false)} }>
              <Text style={styles.modal_text}>Vip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modal_textContainer} onPress={() => {navigation.navigate('Shop'); setModalVisible(false)} }>
              <Text style={styles.modal_text}>Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modal_textContainer} onPress={() => {navigation.navigate('Leaderboard'); setModalVisible(false)} }>
              <Text style={styles.modal_text}>LeaderBoard</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modal_textContainer} 
              onPress={() => {navigation.navigate('Setting'); setModalVisible(false)} }
            >
              <Text style={styles.modal_text}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom : 30
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
    right: 20,
    bottom: 40,
  },
  vipButton: {
    width: 80, 
    height: 80, 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: vipButtonPosition.top,
    right: vipButtonPosition.right,
  },
  menuButton : {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#abb94d',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    bottom: 40,
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
    top: signOutButtonPosition.top,
    right: signOutButtonPosition.left,
  },
  signOutImage: {
    width: 30,
    height: 30,
  } ,
  modal : {
    positions : 'absolute',
    top : 240, 
    left : 70,
    width : 250,
    height : 340,
    backgroundColor : 'white',
    borderRadius : 10,
    backgroundColor : '#98fb98',
  },
  modalContent : {
    padding :20,
    flex : 1,
    justifyContent : 'center',
    alignItems : 'center',
    marginTop :20,
  },
  modal_textContainer : {
    padding : 10,
    justifyContent : 'space-between',
    alignItems : 'center',
    width : '100%',
  },
  closeModal : {
    position : 'absolute',
    top : 0,
    right : 0,
    backgroundColor : '#ff6347',
    width : 35,
    height : 40,
    borderTopRightRadius : 10,
  },
  modal_text: {
    height : 30,
    fontFamily : 'AlegreyaSans-Black',
    fontSize : 20
  }
});

export default Home;
