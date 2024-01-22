
import React, { useState, useEffect, useContext } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, Alert } from 'react-native';
import { Video } from 'expo-av';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import * as Font from 'expo-font';
import { getUserData, updateUserData } from '../utils/actions/userActions';
import { getAuth } from 'firebase/auth';
import { Audio } from 'expo-av';
import { Modal } from 'react-native';
import sound from './sound';
import { ShopContext } from './ShopContext';

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
  top: screenHeight * 0.08, 
  left: screenWidth * 0.78, 
};

const vipButtonPosition = {
  top: screenHeight * 0.22, 
  right: screenWidth * 0.247, 
};

const spinButtonPosition = {
  top: screenHeight * -0.421, // 5% từ đỉnh màn hình
  right: screenWidth * -0.455, // 5% từ cạnh phải màn hình
};

const Home = ({ navigation }) => {
  const [rabbitLvl1, setRabbitLvl1] = useState('No');
  const [rabbitLvl2, setRabbitLvl2] = useState('No');
  const { selectedItem } = useContext(ShopContext);
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
    const fetchUserData = async () => {
      const userData = await getUserData(auth.currentUser.uid);
      setTotalWatered(userData.totalWatered);
    };
  
    const interval = setInterval(fetchUserData, 5000); // 1000 milliseconds = 1 second
  
    return () => clearInterval(interval); // This is important to clear the interval when the component unmounts
  }, []);  

  useEffect(() => {
  const fetchUserData = async () => {
    const userData = await getUserData(auth.currentUser.uid);

    // Check if the fields exist, and if not, add them
    if (userData.Rabbitlvl1Applied === undefined) {
      userData.Rabbitlvl1Applied = 'No';
      await updateUserData(auth.currentUser.uid, { Rabbitlvl1Applied: 'No' });
    }
    if (userData.Rabbitlvl2Applied === undefined) {
      userData.Rabbitlvl2Applied = 'No';
      await updateUserData(auth.currentUser.uid, { Rabbitlvl2Applied: 'No' });
    }

    setRabbitLvl1(userData.Rabbitlvl1Applied);
    setRabbitLvl2(userData.Rabbitlvl2Applied);
  };

  fetchUserData();
}, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData(auth.currentUser.uid);
      setRabbitLvl1(userData.Rabbitlvl1Applied);
      setRabbitLvl2(userData.Rabbitlvl2Applied);
    };
  
    // Call the function once immediately
    fetchUserData();
  
    // Then set up the interval to call the function every 3 seconds
    const intervalId = setInterval(fetchUserData, 3000);
  
    // Don't forget to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);
  
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
      {selectedItem && <Image source={selectedItem.image} style={styles.backgroundImage} />}
      {rabbitLvl1 === 'Yes' && <Image source={require('../assets/images/rabbitlvl1home.png')} style={styles.rabbitImage1} />}
      {rabbitLvl2 === 'Yes' && <Image source={require('../assets/images/rabbitlvl2home.png')} style={styles.rabbitImage2} />}
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
      <TouchableOpacity onPress={() => navigation.navigate('Spin')}>
        <Image source={require('../assets/images/spin.png')} style={styles.spinButton} />
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
        }}
      >
        <View style={[styles.modal, { backgroundColor: '#abb94d', height: '55%' }]}>
          <View style={{ height: 1 }} />
          <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 3, ...styles.modal_text }}>Menu</Text>
          <TouchableOpacity
            style={styles.closeModal}
            onPress={() => {
              setModalVisible(false);
            }}
          >
            <Text style={{ fontSize: 25, marginLeft: 10, marginTop: 3 }}>x</Text>
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.modal_textContainer, { borderWidth: 1, borderColor: 'black', flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                navigation.navigate('User');
                setModalVisible(false);
              }}
            >
              <Image
                source={require('../assets/images/profile.png')}
                style={{ width: 40, height: 40, marginRight: 10 }}
              />
              <Text style={[styles.modal_text, { marginRight: 22, marginTop: 1 }]}>Your Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modal_textContainer, { borderWidth: 1, borderColor: 'black', flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
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
                setModalVisible(false);
              }}
            >
              <Image
                source={require('../assets/images/vip.png')}
                style={{ width: 40, height: 40, marginRight: 10 }}
              />
              <Text style={[styles.modal_text, { marginRight: 56, marginTop: 1 }]}>VIP</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modal_textContainer, { borderWidth: 1, borderColor: 'black', flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                navigation.navigate('Shop');
                setModalVisible(false);
              }}
            >
              <Image
                source={require('../assets/images/shop.png')}
                style={{ width: 40, height: 40, marginRight: 10 }}
              />
              <Text style={[styles.modal_text, { marginRight: 52, marginTop: 1 }]}>Shop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modal_textContainer, { borderWidth: 1, borderColor: 'black', flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                navigation.navigate('Leaderboard');
                setModalVisible(false);
              }}
            >
              <Image
                source={require('../assets/images/leaderboard.png')}
                style={{ width: 40, height: 40, marginRight: 10 }}
              />
              <Text style={[styles.modal_text, { marginRight: 20, marginTop: 1 }]}>Leaderboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modal_textContainer, { borderWidth: 1, borderColor: 'black', flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => {
                navigation.navigate('Setting');
                setModalVisible(false);
              }}
            >
              <Image
                source={require('../assets/images/settings.png')}
                style={{ width: 40, height: 40, marginRight: 10 }}
              />
              <Text style={[styles.modal_text, { marginRight: 40, marginTop: 1 }]}>Settings</Text>
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
  spinButton: {
    width: 80, 
    height: 80, 
    position: 'absolute',
    top: spinButtonPosition.top,
    right: spinButtonPosition.right,
  },
  rabbitImage1: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 550,
    bottom : 40,
    left : 80,
  },
  rabbitImage2: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 550,
    bottom : 40,
    left : 300,
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
    backgroundColor: '#abb94d',
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
