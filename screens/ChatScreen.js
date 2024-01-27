import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-elements'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { GiftedChat } from 'react-native-gifted-chat'
import { getFirebaseApp } from '../utils/firebaseHelper'
import { getDatabase, ref, onValue, push, off } from 'firebase/database'

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([])
  const app = getFirebaseApp()
  const auth = getAuth(app)
  const db = getDatabase(app)
  const chatsRef = ref(db, 'chats')
  const friendId = route.params.friendId

  const signOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace('Login')
      })
      .catch((error) => {
        // An error happened.
      })
  }

  useEffect(() => {
    if (route.params && route.params.friendName) {
      navigation.setOptions({
        title: route.params.friendName, // Set the title to the friend's name
      })
    }
    // Rest of your code...
  }, [navigation, db])

  useEffect(() => {
    const conversationId = generateConversationId(auth.currentUser.uid, friendId)
    const conversationRef = ref(db, `chats/${conversationId}`)
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ marginLeft: 20 }}>
          <Avatar
            rounded
            source={{
              uri: auth?.currentUser?.photoURL,
            }}
          />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={signOut}
        >
          <Text>logout</Text>
        </TouchableOpacity>
      ),
    })

    onValue(conversationRef, (snapshot) => {
      const data = snapshot.val()
      const firebaseMessages = data
        ? Object.values(data)
            .map((m) => ({
              ...m,
              createdAt: m.createdAt && m.createdAt.seconds ? new Date(m.createdAt.seconds * 1000) : new Date(),
            }))
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // Reverse the sort order
        : []
      setMessages(firebaseMessages.reverse()) // Reverse the array here
    })

    return () => {
      off(conversationRef)
    }
  }, [navigation, db])

  const generateConversationId = (userId1, userId2) => {
    // Ensure the conversation ID is the same regardless of the order of userId1 and userId2
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`
  }

  const onSend = useCallback((messages = []) => {
    const conversationId = generateConversationId(auth.currentUser.uid, friendId) // Assuming friendId is the id of the friend
    const conversationRef = ref(db, `chats/${conversationId}`)
    for (let i = 0; i < messages.length; i++) {
      const { _id, createdAt, text, user } = messages[i]
      // Ensure createdAt is a Date object
      const timestamp = createdAt instanceof Date ? createdAt.getTime() : Date.now()
      push(conversationRef, { _id, createdAt: timestamp, text, user })
    }
  }, [])

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={true}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth?.currentUser?.email,
          name: auth?.currentUser?.displayName,
          avatar: auth?.currentUser?.photoURL,
        }}
      />
      <Text style={styles.userName}>{route.params.friendName}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userName: {
    position: 'absolute',
    top: '5%',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center', // Add this
    width: '100%', // And this
  },
})

export default ChatScreen
