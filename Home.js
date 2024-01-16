import React from 'react';
import { Video } from 'expo-av';

const Home = () => {
  return (
    <Video
      source={require('../assets/videos/video.mp4')}
      rate={1.0}
      volume={1.0}
      isMuted={false}
      resizeMode="cover"
      shouldPlay
      isLooping
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Home;
