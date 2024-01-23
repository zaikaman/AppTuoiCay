import { View, Text, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, FONTS } from '../constants'
import { getDatabase, ref, get, update, child } from "firebase/database";
import { getFirebaseApp } from "../utils/firebaseHelper";
import { getAuth } from "firebase/auth";
import { useCallback, useEffect, useState } from 'react';


export default function AddFr() {
  
  const [searchName, setSearchName] = useState('')
  const [friendsList, setFriendsList] = useState([])

  const getUserIdByFullName = async (fullName) => {
    try {
      const app = getFirebaseApp()
      const dbRef = ref(getDatabase(app))
      const usersRef = child(dbRef, 'users')
      const snapshot = await get(usersRef)
      const users = snapshot.val()
      for (let userId in users) {
        if (users[userId].fullName === fullName) {
          return userId // Return the user ID
        }
      }
      return null // Return null if no user is found
    } catch (error) {
      console.error("Error in getUserIdByFullName: ", error);
      throw error; // Re-throw the error so it can be handled further up the call stack
    }
  }
  
  const onHandleAddFr = async () => {
    try {
      const friendFullName = searchName; // The full name of the friend to add
      const friendId = await getUserIdByFullName(friendFullName); // Get the friend's user ID
      if(friendId !== null) {
        const app = getFirebaseApp();
        const db = getDatabase(app);
        const auth = getAuth(app);
        const userRef = ref(db, `users/${auth.currentUser.uid}`); // link with the current user ID
        const friendRef = ref(db, `users/${friendId}`); // link with the friend's user ID
        // Update list Friend for the current user
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        console.log(userData)
        if (!userData.listFriend_byFullName) {
          userData.listFriend_byFullName = [];
        }
        if (userData.listFriend_byFullName.includes(searchName)) {
          setSearchName('')
          return (
            Alert.alert("Thêm bạn bè", "Người dùng này đã là bạn bè")
          )
        } else {
          userData.listFriend_byFullName.push(searchName);
          const updates = {
            listFriend_byFullName : userData.listFriend_byFullName
          };
          update(userRef, updates);
          // Update list Friend for the friend
          const friendSnapshot = await get(friendRef);
          const friendData = friendSnapshot.val();
          if (!friendData.listFriend_byFullName) {
            friendData.listFriend_byFullName = [];
          }
          if (!friendData.listFriend_byFullName.includes(userData.fullName)) {
            friendData.listFriend_byFullName.push(userData.fullName);
            const friendUpdates = {
              listFriend_byFullName : friendData.listFriend_byFullName
            };
            update(friendRef, friendUpdates);
          }
          setSearchName('')
          return (
            Alert.alert("Thêm bạn bè","Kết bạn thành công")
          )
        }
      } else {
        setSearchName('')
        return (
          Alert.alert("Thêm bạn bè","Không tìm thấy người dùng")
        )
      }
    } catch (error) {
      console.error("Error in onHandleAddFr: ", error);
      throw error; // Re-throw the error so it can be handled further up the call stack
    }
  }
  
  const getFriendData = async (fullName) => {
    try {
      const app = getFirebaseApp();
      const db = getDatabase(app);
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val();
      for (let userId in users) {
        if (users[userId].fullName === fullName) {
          return users[userId].fullName; 
        }
      }
      return null; 
    } catch (error) {
      console.error("Error in getFriendData: ", error);
      throw error; 
    }
  }

  const getAllFriendsData = async () => {
    try {
      const app = getFirebaseApp();
      const db = getDatabase(app);
      const auth = getAuth(app);
      const userRef = ref(db, `users/${auth.currentUser.uid}`); 
      const snapshot = await get(userRef);
      const userData = snapshot.val();
      if (!userData.listFriend_byFullName) {
        return [];
      }
      // Get data for each friend
      const friendsDataPromises = userData.listFriend_byFullName.map(friend => getFriendData(friend));
      const friendsData = await Promise.all(friendsDataPromises);
    return friendsData;
    } catch (error) {
      console.error("Error in getAllFriendsData: ", error);
      throw error;
    }
  }

  
  
  
  
  return (
    <View>
      <View style = {{flexDirection : 'row', justifyContent : 'space-between'}}>
          <View
                style={{
                  height: 24,
                  width: 120,
                  borderColor: COLORS.secondaryGray,
                  borderWidth: 1,
                  borderRadius: 4,
                  marginVertical: 6,
                  justifyContent: "center",
                  paddingLeft: 8,
                  marginRight : 10
                }}
              >
                <TextInput
                  value={searchName}
                  onChangeText={(text) => setSearchName(text)}
                  placeholder='Add friend'
                  placeholderTextColor= 'pink'
                />
              </View>
          <TouchableOpacity onPress={onHandleAddFr}>
              <MaterialIcons 
                  name = 'person-add'
                  size={30}
                  color={COLORS.black}
              />
          </TouchableOpacity>
          
      </View>
      
      <View>
          {/* <FlatList
            data={friendsList}
            keyExtractor={(index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style = {{paddingVertical : 5, paddingHorizontal : 10}}>
                  <Text style = {{fontSize : FONTS.h2, color : COLORS.white}} key={index}>{item}</Text>
              </View>
            )}
          /> */}
        </View>
    </View>
  )
}