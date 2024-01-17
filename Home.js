import React, { useState } from 'react';
import { View, Image, Button, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

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

  const waterTree = () => {
    if (treeStage < stages.length - 1) {
      setTreeStage(treeStage + 1);
      setTreeSize(sizes[treeStage + 1]);
      setTreePosition(positions[treeStage + 1]);
    }
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
      <Image source={stages[treeStage]} style={{...styles.tree, width: treeSize, height: treeSize, top: treePosition}} resizeMode="contain" />
      <View style={styles.buttonContainer}>
        <Button title="Tưới cây" color="blue" onPress={waterTree} />
      </View>
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
  buttonContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
});

export default Home;
