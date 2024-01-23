
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

const adsButtonPosition = {
  top: screenHeight * 0.1, 
  left: screenWidth * 0.377, 
};

const Home = ({ navigation }) => {
  const [rabbitLvl1, setRabbitLvl1] = useState('No');
  const [rabbitLvl2, setRabbitLvl2] = useState('No');
  const [foxLvl1, setFoxLvl1] = useState('No');
  const [foxLvl2, setFoxLvl2] = useState('No');
  const [birdLvl1, setBirdLvl1] = useState('No');
  const [birdLvl2, setBirdLvl2] = useState('No');
  const [monkeyLvl1, setMonkeyLvl1] = useState('No');
  const [monkeyLvl2, setMonkeyLvl2] = useState('No');
  // const [elephantLvl1, setElephantLvl1] = useState('No');
  // const [elephantLvl2, setElephantLvl2] = useState('No');
  const [horseLvl1, setHorseLvl1] = useState('No');
  const [horseLvl2, setHorseLvl2] = useState('No');
  const [wolfLvl1, setWolfLvl1] = useState('No');
  const [wolfLvl2, setWolfLvl2] = useState('No');
  // const [background1, setBackground1] = useState('No');
  // const [background2, setBackground2] = useState('No');
  // const [background3, setBackground3] = useState('No');
  // const [background4, setBackground4] = useState('No');
  // const [background5, setBackground5] = useState('No');
  // const [background6, setBackground6] = useState('No');
  const { selectedItem } = useContext(ShopContext);
  const [treeStage, setTreeStage] = useState(0);
  const [treeSize, setTreeSize] = useState(sizes[0]);
  const [treePosition, setTreePosition] = useState(positions[0]);
  const [totalWatered, setTotalWatered] = useState(0);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [remainingWaterTimes, setRemainingWaterTimes] = useState(10000);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(0);
  const [waterAmount, setWaterAmount] = useState(0.001); // Initialize waterAmount state variable
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
      setWaterAmount(userData.waterAmount);
      setSpinsLeft(userData.spinsLeft);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    updateUserData(auth.currentUser.uid, {
      treeStage,
      totalWatered,
      treeSize,
      treePosition,
      waterAmount,
      spinsLeft,
    });
  }, [treeStage, totalWatered, treeSize, treePosition, waterAmount, spinsLeft]);

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
      const fields = [
        'Rabbitlvl1', 'Rabbitlvl2',
        'Foxlvl1', 'Foxlvl2',
        'Birdlvl1', 'Birdlvl2',
        'Monkeylvl1', 'Monkeylvl2',
        // 'Elephantlvl1', 'Elephantlvl2',
        'Horselvl1', 'Horselvl2',
        'Wolflvl1', 'Wolflvl2',
        // 'Background1', 'Background2', 'Background3',
        // 'Background4', 'Background5', 'Background6'
      ];
      for (let field of fields) {
        if (userData[`${field}Applied`] === undefined) {
          userData[`${field}Applied`] = 'No';
          await updateUserData(auth.currentUser.uid, { [`${field}Applied`]: 'No' });
        }
        setFieldState(field, userData[`${field}Applied`]);
      }
    };
  
    fetchUserData();
  }, []);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await getUserData(auth.currentUser.uid);
      const fields = [
        'Rabbitlvl1', 'Rabbitlvl2',
        'Foxlvl1', 'Foxlvl2',
        'Birdlvl1', 'Birdlvl2',
        'Monkeylvl1', 'Monkeylvl2',
        // 'Elephantlvl1', 'Elephantlvl2',
        'Horselvl1', 'Horselvl2',
        'Wolflvl1', 'Wolflvl2'
        // 'Background1', 'Background2', 'Background3',
        // 'Background4', 'Background5', 'Background6'
      ];
      for (let field of fields) {
        setFieldState(field, userData[`${field}Applied`]);
      }
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

  const animals = [
    { name: 'Rabbitlvl1', increase: 0.01 },
    { name: 'Rabbitlvl2', increase: 0.02 },
    { name: 'Foxlvl1', increase: 0.03 },
    { name: 'Foxlvl2', increase: 0.05 },
    { name: 'Birdlvl1', increase: 0.07 },
    { name: 'Birdlvl2', increase: 0.10 },
    { name: 'Monkeylvl1', increase: 0.13 },
    { name: 'Monkeylvl2', increase: 0.17 },
    { name: 'Horselvl1', increase: 0.31 },
    { name: 'Horselvl2', increase: 0.37 },
    { name: 'Wolflvl1', increase: 0.43 },
    { name: 'Wolflvl2', increase: 0.50 },
  ];  

  const setFieldState = (field, value) => {
    switch(field) {
      case 'Rabbitlvl1':
        setRabbitLvl1(value);
        break;
      case 'Rabbitlvl2':
        setRabbitLvl2(value);
        break;
      case 'Foxlvl1':
        setFoxLvl1(value);
        break;
      case 'Foxlvl2':
        setFoxLvl2(value);
        break;
      case 'Birdlvl1':
        setBirdLvl1(value);
        break;
      case 'Birdlvl2':
        setBirdLvl2(value);
        break;
      case 'Monkeylvl1':
        setMonkeyLvl1(value);
        break;
      case 'Monkeylvl2':
        setMonkeyLvl2(value);
        break;
      // case 'Elephantlvl1':
      //   setElephantLvl1(value);
      //   break;
      // case 'Elephantlvl2':
      //   setElephantLvl2(value);
      //   break;
      case 'Horselvl1':
        setHorseLvl1(value);
        break;
      case 'Horselvl2':
        setHorseLvl2(value);
        break;
      case 'Wolflvl1':
        setWolfLvl1(value);
        break;
      case 'Wolflvl2':
        setWolfLvl2(value);
        break;
      default:
        console.log(`No matching field found for ${field}`);
    }
  };  

  const waterTree = async () => {
    if (auth.currentUser) {
      const userData = await getUserData(auth.currentUser.uid);
  
      if (remainingWaterTimes > 0) {
        let newWaterAmount = waterAmount; // Sử dụng biến mới để không làm thay đổi trạng thái trực tiếp
  
        // Loop through the animals array and check if each animal has been applied
        for (let animal of animals) {
          if (newWaterAmount >= 0.0039) { // Nếu waterAmount lớn hơn hoặc bằng 0.0039, dừng vòng lặp
            break;
          }
        
          if (userData[`${animal.name}Applied`] === 'Yes') {
            newWaterAmount += newWaterAmount * animal.increase;
          }
        }
        
        let newTotal = totalWatered + newWaterAmount;
        setTotalWatered(newTotal);
  
        if (newTotal >= treeStage + 1 && treeStage < stages.length - 1) {
          let newTreeStage = treeStage + 1;
          setTreeStage(newTreeStage);
          setTreeSize(sizes[newTreeStage]);
          setTreePosition(positions[newTreeStage]);
        }
  
        setRemainingWaterTimes(remainingWaterTimes - 1);
        setWaterAmount(newWaterAmount); // Cập nhật trạng thái waterAmount
        updateUserData(auth.currentUser.uid, {
          remainingWaterTimes: remainingWaterTimes - 1,
          waterAmount: newWaterAmount, // Update the waterAmount field in the database
        });
      }
    } else {
      console.log('User is not logged in');
    }
  };  

  const addMoreSpins = async () => {
    // Hiển thị hộp thoại xác nhận
    Alert.alert(
      "Free Spin",
      "Do you want to watch an ad for a free spin?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", 
          onPress: async () => {
            // Cập nhật spinsLeft trong cơ sở dữ liệu
            await updateUserData(auth.currentUser.uid, { spinsLeft: spinsLeft + 1 });
  
            // Cập nhật trạng thái spinsLeft
            setSpinsLeft(spinsLeft + 1);
          
            // Hiển thị thông báo
            Alert.alert("Success", "A free spin has been added!");
          }
        }
      ]
    );
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
      {foxLvl1 === 'Yes' && <Image source={require('../assets/images/foxlvl1home.png')} style={styles.foxImage1} />}
      {foxLvl2 === 'Yes' && <Image source={require('../assets/images/foxlvl2home.png')} style={styles.foxImage2} />}
      {monkeyLvl1 === 'Yes' && <Image source={require('../assets/images/monkeylvl1home.png')} style={styles.monkeyImage1} />}
      {monkeyLvl2 === 'Yes' && <Image source={require('../assets/images/monkeylvl2home.png')} style={styles.monkeyImage2} />}
      {/* {elephantLvl1 === 'Yes' && <Image source={require('../assets/images/elephantlvl1home.png')} style={styles.elephantImage1} />}
      {elephantLvl2 === 'Yes' && <Image source={require('../assets/images/elephantlvl2home.png')} style={styles.elephantImage2} />} */}
      {horseLvl1 === 'Yes' && <Image source={require('../assets/images/horselvl1home.png')} style={styles.horseImage1} />}
      {horseLvl2 === 'Yes' && <Image source={require('../assets/images/horselvl2home.png')} style={styles.horseImage2} />}
      {wolfLvl1 === 'Yes' && <Image source={require('../assets/images/wolflvl1home.png')} style={styles.wolfImage1} />}
      {wolfLvl2 === 'Yes' && <Image source={require('../assets/images/wolflvl2home.png')} style={styles.wolfImage2} />}
      {/* {background3 === 'Yes' && <Image source={require('../assets/images/background3.png')} style={styles.backgroundImage3} />}
      {background4 === 'Yes' && <Image source={require('../assets/images/background4.png')} style={styles.backgroundImage4} />}
      {background5 === 'Yes' && <Image source={require('../assets/images/background5.png')} style={styles.backgroundImage5} />}
      {background6 === 'Yes' && <Image source={require('../assets/images/background6.png')} style={styles.backgroundImage6} />} */}
      {birdLvl1 === 'Yes' && <Image source={require('../assets/images/birdlvl1home.png')} style={styles.birdImage1} />}
      {birdLvl2 === 'Yes' && <Image source={require('../assets/images/birdlvl2home.png')} style={styles.birdImage2} />}
      {/* {background1 === 'Yes' && <Image source={require('../assets/images/background1.png')} style={styles.backgroundImage1} />}
      {background2 === 'Yes' && <Image source={require('../assets/images/background2.png')} style={styles.backgroundImage2} />} */}
      <View style={styles.progressBarContainer}>
        <ProgressBarAnimated
          width={barWidth}
          value={(treeStage + 1) * 10}
          backgroundColorOnComplete="#6CC644"
          useNativeDriver={false}
        />
        {fontLoaded && <Text style={{ ...styles.moneyEarned, color: 'yellow' }}>🌳 {(totalWatered || 0).toFixed(4)}</Text>}
      </View>
      <View style={styles.remainingContainer}>
        {fontLoaded && <Text style={{ ...styles.remainingText, color: 'yellow' }}>💧 {remainingWaterTimes}</Text>}
        {fontLoaded && <Text style={{ ...styles.remainingText, color: 'yellow' }}>⚡ {waterAmount.toFixed(4)}</Text>}
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
      <TouchableOpacity 
        style={styles.addSpinsButton}
        onPress={addMoreSpins}
      >
        <Image 
          source={require('../assets/images/ads.png')} 
          style={styles.addSpinsButton} // Use the same style as your TouchableOpacity
        />
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
    right: 20,
    bottom: 100,
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
  foxImage1: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 500,
    bottom : 40,
    left : 100,
  },
  foxImage2: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 500,
    bottom : 40,
    left : 70,
  },
  birdImage1: {
    width: '20%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 265,
    bottom : 40,
    left : 310,
  },
  birdImage2: {
    width: '20%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 100,
    bottom : 40,
    left : 70,
  },
  monkeyImage1: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 520,
    bottom : 40,
    left : 340,
  },
  monkeyImage2: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 190,
    bottom : 40,
    left : 300,
  },
  // elephantImage1: {
  //   width: '30%', // or any other size
  //   height: '30%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  //   top : 480,
  //   bottom : 40,
  //   left : 130,
  // },
  // elephantImage2: {
  //   width: '10%', // or any other size
  //   height: '10%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  //   top : 500,
  //   bottom : 40,
  //   left : 70,
  // },
  horseImage1: {
    width: '12%', // or any other size
    height: '12%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 480,
    bottom : 40,
    left : 22,
  },
  horseImage2: {
    width: '18%', // or any other size
    height: '18%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 550,
    bottom : 40,
    left : 200,
  },
  wolfImage1: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 600,
    bottom : 40,
    left : 100,
  },
  wolfImage2: {
    width: '10%', // or any other size
    height: '10%', // or any other size
    position: 'absolute', // if you want it to be positioned absolutely
    top : 500,
    bottom : 40,
    left : 250,
  },
  // backgroundImage1: {
  //   width: '100%', // or any other size
  //   height: '100%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  // },
  // backgroundImage2: {
  //   width: '100%', // or any other size
  //   height: '100%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  // },
  // backgroundImage3: {
  //   width: '100%', // or any other size
  //   height: '100%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  // },
  // backgroundImage4: {
  //   width: '100%', // or any other size
  //   height: '100%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  // },
  // backgroundImage5: {
  //   width: '100%', // or any other size
  //   height: '100%', // or any other size
  //   position: 'absolute', // if you want it to be positioned absolutely
  // },
  remainingText: {
    fontFamily: 'AlegreyaSans-Black',
    fontSize: 16,
    marginBottom : 8
  },
   addSpinsButton: {
     position: 'absolute',
     top : adsButtonPosition.top,
     left: adsButtonPosition.left,
     // Add dimensions for your image if necessary
     width: 80, // Adjust to the width of your image
     height: 80, // Adjust to the height of your image
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
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'blue',
  },
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
