import React, { useState } from 'react'; // Thêm useState
import { Image } from 'react-native';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "react-native-elements";
import styles from './style';

export default function RegisterScreen() {
  const [username, setUsername] = useState(''); // Thêm dòng này
  const [password, setPassword] = useState(''); // Thêm dòng này
  const [confirmPassword, setConfirmPassword] = useState(''); // Thêm dòng này

  const onRegisterPress = () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    // Logic for registration
    fetch('http://sql12.freesqldatabase.com:3306/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username, // Thay thế 'your-username' bằng username
        password: password, // Thay thế 'your-password' bằng password
      }),
    })
    .then((response) => response.text())
    .then((text) => {
      if (text === 'User registered') {
        Alert.alert("Successfully registered!1");
      } else {
        Alert.alert("Successfully registered!2");
      }
    });
  };

  return (
    <KeyboardAvoidingView style={styles.containerView} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.loginScreenContainer}>
          <View style={styles.loginFormView}>
            <Text style={styles.logoText}>Money Tree</Text>
            <TextInput
              placeholder="Username"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              onChangeText={text => setUsername(text)} // Thêm dòng này
            />
            <TextInput
              placeholder="Password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              secureTextEntry={true}
              onChangeText={text => setPassword(text)} // Thêm dòng này
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderColor="#c4c3cb"
              style={styles.loginFormTextInput}
              secureTextEntry={true}
              onChangeText={text => setConfirmPassword(text)} // Thêm dòng này
            />
            <Button
              buttonStyle={styles.loginButton}
              onPress={() => onRegisterPress()}
              title="Register"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
