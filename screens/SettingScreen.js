import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

const Settings = () => {
  const [volume, setVolume] = useState(0.5); // Initial volume is 0.5

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.volumeControl}>
        <View style={styles.textContainer}>
          <Text>Sound Volume</Text>
        </View>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={setVolume}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '110%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start', // căn chữ 'Sound Volume' sang trái
  },
});

export default Settings;