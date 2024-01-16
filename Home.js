import React from 'react';
import VLCPlayer from 'react-native-vlc-media-player';

const Home = () => {
  return (
    <VLCPlayer
      style={{ width: '100%', height: '100%' }}
      video={{ uri: '../assets/videos/video.mp4' }}
      autoplay={true}
      isLooping={true}
    />
  );
};

export default Home;
