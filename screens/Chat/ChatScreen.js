import { useCallback, useState, useEffect } from 'react';
import { View, Text } from 'react-native'
import { GiftedChat } from "react-native-gifted-chat"; 
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getFirebaseApp } from "../../utils/firebaseHelper";
import { getAuth } from "firebase/auth";
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen({navigation}) {
    
    const [messages, setMessages] = useState([]);

    // useEffect(() => {
    //     const app = getFirebaseApp();
    //     const db = getDatabase(app);
    //     const auth = getAuth(app);
    //     const userRef = ref(db, `users/${auth.currentUser.uid}`); // link with the current user ID
    
    //     // Fetch user data from Firebase
    //     onValue(userRef, (snapshot) => {
    //       const data = snapshot.val();
    //       setName(data.fullName);
    //       setEmail(data.email);
    //       if (data.profilePicture) {
    //         setSelectedImage(data.profilePicture);
    //       }
    //       if (data.profilePictureIndex !== undefined) {
    //         setSelectedImageIndex(data.profilePictureIndex);
    //         setSelectedImage(profileImages[data.profilePictureIndex]);
    //       }
    //       if(data.profilePictureFromUser !== undefined) {
    //         setImage(data.profilePictureFromUser)
    //       }
    //     });
    //   }, []);


    

    // useEffect(() => {
    //   setMessages([
    //     {
    //       _id: 1,
    //       text: 'Hello developer',
    //       createdAt: new Date(),
    //       user: {
    //         _id: 2,
    //         name: 'React Native',
    //         avatar: 'https://placeimg.com/140/140/any',
    //       },
    //     },
    //   ])
    // }, [])
  
    // const onSend = useCallback((messages = []) => {
    //   setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    // }, [])
  
    return (
      <SafeAreaView style = {{flex : 1, backgroundColor : 'white'}}>
          <View style={{flex :1,paddingTop : 50}}>
              <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: 1,
                }}
              />
          </View>
      </SafeAreaView>
    )
}