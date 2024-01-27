import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Avatar } from 'react-native-elements'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { GiftedChat } from 'react-native-gifted-chat'
import { getFirebaseApp } from '../utils/firebaseHelper'
import { getDatabase, ref, onValue, push, off, get } from 'firebase/database'

const ChatScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([])
  const app = getFirebaseApp()
  const auth = getAuth(app)
  const db = getDatabase(app)
  const chatsRef = ref(db, 'chats')
  const friendId = route.params.friendId
  const [profilePicture, setProfilePicture] = useState(null)

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

  const getProfilePicture = async (userId) => {
    try {
      const app = getFirebaseApp()
      const db = getDatabase(app)
      const userRef = ref(db, `users/${userId}`)
      const snapshot = await get(userRef)
      const userData = snapshot.val()
      return userData.profilePicture // Assuming this is the field in your database
    } catch (error) {
      console.error('Error in getProfilePicture: ', error)
      throw error
    }
  }

  useEffect(() => {
    getProfilePicture(friendId).then((url) => setProfilePicture(url))
  }, [])

  useEffect(() => {
    if (route.params && route.params.friendName) {
      navigation.setOptions({
        title: route.params.friendName, // Set the title to the friend's name
        headerLeft: () => (
          <View style={{ marginLeft: 10 }}>
            <Image
              source={{ uri: profilePicture }} // Assuming this is passed in the route params
              style={{ width: 50, height: 50, borderRadius: 25 }} // Adjust the size and shape as needed
            />
          </View>
        ),
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
      <View style={styles.userNameContainer}>
        <Image
          source={{ uri: profilePicture }}
          style={{ width: 50, height: 50, borderRadius: 25 }} // Adjust the size and shape as needed
        />
        <Text style={styles.userName}>{route.params.friendName}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userNameContainer: {
    position: 'absolute',
    top: '0%',
    width: '115%',
    backgroundColor: '#f2f2f2',
    zIndex: 1,
    paddingTop: 40, // Tăng giá trị này để làm phần trên của tab dày hơn
    padding: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#ccc',
  },
  userName: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
    top: '100%',
    paddingLeft: 80,
  },
})

export default ChatScreen
