import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, FONTS } from '../constants'
import { getDatabase, ref, get, update, child } from 'firebase/database'
import { getFirebaseApp } from '../utils/firebaseHelper'
import { getAuth } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { Modal } from 'react-native'

export default function FriendsList({ navigation }) {
  const [searchName, setSearchName] = useState('')
  const [elements, setElements] = useState([]) // tên bạn bè
  const [requests, setRequests] = useState([]) // yêu cầu kết bạn
  const [modalVisible, setModalVisible] = useState(false) // menu friend action
  const [unFrName, setUnFrName] = useState('') // lưu tên bạn bè muốn xóa
  const [state, setState] = useState(false)

  // Kiểm tra tồn tại và trả về userId của bạn bè
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
      console.error('Error in getUserIdByFullName: ', error)
      throw error // Re-throw the error so it can be handled further up the call stack
    }
  }
  // từ chối lời mời kết bạn
  const onHandleRefuse = async (requestName) => {
    try {
      const app = getFirebaseApp()
      const db = getDatabase(app)
      const auth = getAuth(app)
      const userRef = ref(db, `users/${auth.currentUser.uid}`)
      const snapshot = await get(userRef)
      const userData = snapshot.val()

      const updates = {
        friends_Request: userData.friends_Request.filter((name) => name !== requestName),
      }
      update(userRef, updates)
    } catch (error) {
      console.error('Error in Refuse: ', error)
      throw error
    }
  }
  // Truy xuất các trường bất kì của bạn bè
  const getFriendData = async (fullName) => {
    try {
      const app = getFirebaseApp()
      const db = getDatabase(app)
      const usersRef = ref(db, 'users')
      const snapshot = await get(usersRef)
      const users = snapshot.val()
      for (let userId in users) {
        if (users[userId].fullName === fullName) {
          return users[userId].fullName
        }
      }
      return null
    } catch (error) {
      console.error('Error in getFriendData: ', error)
      throw error
    }
  }
  // Trả thông tin truy xuất về 1 mảng
  const getAllFriendsData = async () => {
    try {
      const app = getFirebaseApp()
      const db = getDatabase(app)
      const auth = getAuth(app)
      const userRef = ref(db, `users/${auth.currentUser.uid}`)
      const snapshot = await get(userRef)
      const userData = snapshot.val()
      if (!userData.listFriend_byFullName) {
        return []
      }
      // Get data for each friend
      const friendsDataPromises = userData.listFriend_byFullName.map((friend) => getFriendData(friend))
      const friendsData = await Promise.all(friendsDataPromises)
      return friendsData
    } catch (error) {
      console.error('Error in getAllFriendsData: ', error)
      throw error
    }
  }
  // Gửi lời mời kết bạn
  const onSendRequest = async () => {
    try {
      const friendFullName = searchName // The full name of the friend to add
      const friendId = await getUserIdByFullName(friendFullName) // Get the friend's user ID
      if (friendId !== null) {
        const app = getFirebaseApp()
        const db = getDatabase(app)
        const auth = getAuth(app)
        const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID
        const friendRef = ref(db, `users/${friendId}`) // link with the friend's user ID
        // Update list Friend for the current user
        const snapshot = await get(userRef)
        const userData = snapshot.val()
        if (!userData.listFriend_byFullName) {
          userData.listFriend_byFullName = []
        }
        if (!userData.friends_Request) {
          userData.friends_Request = []
        }

        if (userData.listFriend_byFullName.includes(searchName)) {
          setSearchName('')
          return Alert.alert('Thêm bạn bè', 'Người dùng này đã là bạn bè')
        } else {
          // sendRequest
          const friendSnapshot = await get(friendRef)
          const friendData = friendSnapshot.val()

          if (!friendData.friends_Request) {
            friendData.friends_Request = []
          }

          // thêm trường friends_Request
          if (!friendData.friends_Request.includes(userData.fullName)) {
            friendData.friends_Request.push(userData.fullName)
            const friendUpdates = {
              friends_Request: friendData.friends_Request,
            }
            update(friendRef, friendUpdates)
            setSearchName('')
            return Alert.alert('Thêm bạn bè', 'Đã gửi lời mời kết bạn')
          } else {
            setSearchName('')
            Alert.alert('Thêm bạn bè', 'Ngươi dùng này đã được được gửi lời mời kết bạn')
          }
        }
      } else {
        setSearchName('')
        return Alert.alert('Thêm bạn bè', 'Không tìm thấy người dùng')
      }
    } catch (error) {
      console.error('Error in onHandleAddFr: ', error)
      throw error // Re-throw the error so it can be handled further up the call stack
    }
  }
  // Hiển thị những Request nếu có
  const getAllFriendsRequest = async () => {
    try {
      const app = getFirebaseApp()
      const db = getDatabase(app)
      const auth = getAuth(app)
      const userRef = ref(db, `users/${auth.currentUser.uid}`)
      const snapshot = await get(userRef)
      const userData = snapshot.val()
      if (!userData.friends_Request) {
        return []
      }
      // Get data for each friend
      const friendsRequestPromises = userData.friends_Request.map((friend) => getFriendData(friend))
      const friendsRequest = await Promise.all(friendsRequestPromises)
      return friendsRequest
    } catch (error) {
      console.error('Error in getAllFriendsData: ', error)
      throw error
    }
  }
  // Chấp nhận lời mời kết bạn
  const onHandleAccept = async (requestName) => {
    try {
      const friendId = await getUserIdByFullName(requestName) // Get the friend's user ID
      if (friendId !== null) {
        const app = getFirebaseApp()
        const db = getDatabase(app)
        const auth = getAuth(app)
        const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID
        const friendRef = ref(db, `users/${friendId}`) // link with the friend's user ID
        // Update list Friend for the current user
        const snapshot = await get(userRef)
        const userData = snapshot.val()
        if (!userData.listFriend_byFullName) {
          userData.listFriend_byFullName = []
        }
        if (!userData.listFriend_byFullName.includes(requestName)) {
          userData.listFriend_byFullName.push(requestName)
          const updates = {
            listFriend_byFullName: userData.listFriend_byFullName,
            friends_Request: userData.friends_Request.filter((name) => name !== requestName),
          }
          update(userRef, updates)
          // Update list Friend for the friend
          const friendSnapshot = await get(friendRef)
          const friendData = friendSnapshot.val()
          if (!friendData.listFriend_byFullName) {
            friendData.listFriend_byFullName = []
          }
          if (!friendData.listFriend_byFullName.includes(userData.fullName)) {
            friendData.listFriend_byFullName.push(userData.fullName)
            const friendUpdates = {
              listFriend_byFullName: friendData.listFriend_byFullName,
            }
            update(friendRef, friendUpdates)
          }
        }
      }
    } catch (error) {
      console.error('Error in onHandleAddFr: ', error)
      throw error // Re-throw the error so it can be handled further up the call stack
    }
  }
  // Hiện thao tác với yêu cầu
  const onPressRequest = (requestName) => {
    Alert.alert(
      'Thông báo',
      'Bạn có lời mời kết bạn !',
      [
        {
          text: 'Chấp nhận',
          onPress: () => {
            onHandleAccept(requestName)
          },
        },
        {
          text: 'Từ chối',
          onPress: () => {
            onHandleRefuse(requestName)
          },
          style: 'cancel',
        },
      ],
      { cancelable: false },
    )
  }
  // Hiện thao tác với bạn bè
  const onPressFriendAction = (element) => {
    setModalVisible(true)
  }
  // Xóa kết bạn
  const onUnfriend = async (unFrName) => {
    try {
      const friendId = await getUserIdByFullName(unFrName) // Get the friend's user ID
      if (friendId !== null) {
        const app = getFirebaseApp()
        const db = getDatabase(app)
        const auth = getAuth(app)
        const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID
        const friendRef = ref(db, `users/${friendId}`) // link with the friend's user ID
        // Update list Friend for the current user
        const snapshot = await get(userRef)
        const userData = snapshot.val()
        if (userData.listFriend_byFullName.includes(unFrName)) {
          const updates = {
            listFriend_byFullName: userData.listFriend_byFullName.filter((name) => name !== unFrName),
          }
          update(userRef, updates)
          console.log(userData.listFriend_byFullName)
          // Update list Friend for the friend
          const friendSnapshot = await get(friendRef)
          const friendData = friendSnapshot.val()
          if (friendData.listFriend_byFullName.includes(userData.fullName)) {
            const friendUpdates = {
              listFriend_byFullName: friendData.listFriend_byFullName.filter((name) => name !== userData.fullName),
            }
            update(friendRef, friendUpdates)
          }
        }
        setState(!state)
      }
      setModalVisible(false)
    } catch (error) {
      console.error('Error in onHandleAddFr: ', error)
      throw error // Re-throw the error so it can be handled further up the call stack
    }
  }
  const onHandleUnFr = () => {
    onUnfriend(unFrName)
  }
  // mỗi lần component render thì gọi hàm để trả về cho elements 1 mảng tên các bạn bè và request trả về các yêu cầu kết bạn
  useEffect(() => {
    const fetchData = async () => {
      const friendsRequest = await getAllFriendsRequest()
      setRequests(friendsRequest)
      const friendsData = await getAllFriendsData()
      setElements(friendsData)
    }
    fetchData()
  }, [])

  // Logic hàm (FriendsRequest) : dưới DB sẽ tồn tại 1 trường friends_Request : []
  // Sau khi A thực hiện thao tác kết bạn với B => trường này của B sẽ có tên của A
  // Mỗi khi component này render thì nếu trường != null thì sẽ render ra màn hình các yêu cầu kết bạn
  // Ấn đồng ý => listFriends_byFullName của A và B sẽ có tên nhau (onHandleAddFr), reset tên A trong trường friends_Request

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', paddingTop: 50 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          width: '100%',
          backgroundColor: COLORS.primary,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 10,
            top: 2,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={30} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={{ ...FONTS.h1, color: 'white' }}>List Friend</Text>
      </View>
      <ScrollView style={{ flex: 1, marginTop: 10, width: '100%', paddingHorizontal: 20, backgroundColor: 'white' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginTop: 15,
          }}
        >
          <View
            style={{
              height: 40,
              width: 220,
              borderColor: COLORS.primary,
              borderWidth: 2,
              borderRadius: 4,
              marginVertical: 6,
              justifyContent: 'center',
              paddingLeft: 8,
              marginRight: 10,
            }}
          >
            <TextInput
              value={searchName}
              onChangeText={(text) => setSearchName(text)}
              placeholder="Addfriend.........."
              placeholderTextColor="gray"
              color="black"
            />
          </View>
          <TouchableOpacity onPress={onSendRequest}>
            <MaterialIcons name="person-add" size={30} color={COLORS.black} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: COLORS.white,
            marginTop: 10,
            flex: 1,
            flexDirection: 'column',
            borderRadius: 10,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'start', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(132, 138, 138, 1)', fontSize: 17 }}>Friend Requests : </Text>
            <View
              style={{
                backgroundColor: 'red',
                height: 25,
                width: 25,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white' }}>{requests.length}</Text>
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'column', paddingHorizontal: 20, marginTop: 10 }}>
            {requests
              ? requests.map((requestName, index) => (
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    key={index + Math.random().toString()}
                  >
                    <Text
                      style={{
                        ...FONTS.h3,
                      }}
                    >
                      {requestName}
                    </Text>
                    <TouchableOpacity style={{ marginLeft: 5 }} onPress={onPressRequest.bind(this, requestName)}>
                      <MaterialIcons name="keyboard-arrow-right" size={25} color={COLORS.black} />
                    </TouchableOpacity>
                  </View>
                ))
              : null}
          </View>
        </View>
        <View
          style={{
            backgroundColor: COLORS.white,
            marginTop: 20,
            flex: 1,
            flexDirection: 'column',
            borderRadius: 20,
          }}
        >
          <Text style={{ color: 'rgba(132, 138, 138, 1)', fontSize: 17 }}>Friend List : </Text>
          <View style={{ flex: 1, flexDirection: 'column', paddingHorizontal: 20, marginTop: 10, width: '100%' }}>
            {elements
              ? elements.map((element, index) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      height: 50,
                    }}
                    key={index + Math.random().toString()}
                  >
                    <Text
                      style={{
                        ...FONTS.h3,
                      }}
                    >
                      {element}
                    </Text>
                    <TouchableOpacity
                      style={{}}
                      onPress={() => {
                        setModalVisible(!modalVisible)
                        setUnFrName(element)
                      }}
                    >
                      <MaterialIcons name="menu-open" size={25} color={COLORS.black} />
                    </TouchableOpacity>
                  </View>
                ))
              : null}
          </View>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false)
            }}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <View
                style={[
                  styles.modal,
                  {
                    backgroundColor: 'rgba(227, 221, 224, 0.8)',
                    height: '15%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: '50%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottomWidth: 1, // Độ dày của đường viền
                    borderBottomColor: 'rgba(191, 191, 191, 0.8)',
                  }}
                  onPress={onHandleUnFr}
                >
                  <Text style={styles.modal_text}>Unfriend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ width: '100%', height: '50%', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={styles.modal_text}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  modal: {
    // positions: 'absolute',
    // top: 240,
    // left: 70,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    backgroundColor: '#98fb98',
  },
  modalContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modal_textContainer: {
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  closeModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff6347',
    width: 35,
    height: 40,
    borderTopRightRadius: 10,
  },
  modal_text: {
    fontFamily: 'AlegreyaSans-Black',
    fontSize: 19,
  },
})
