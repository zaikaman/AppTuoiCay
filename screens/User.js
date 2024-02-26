import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Dimensions, Button, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONTS } from '../constants'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'
import { getDatabase, ref, onValue, update } from 'firebase/database'
import { getFirebaseApp } from '../utils/firebaseHelper'
import { getAuth } from 'firebase/auth'
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker'
import * as ImagePicker from 'expo-image-picker'

const profileImages = [
  'https://i.ibb.co/sjpJCcf/image1.png',
  'https://i.ibb.co/nmdz8gC/image2.png',
  'https://i.ibb.co/nzVxMcs/image3.png',
  'https://i.ibb.co/b2YZS61/image4.png',
  'https://i.ibb.co/5KCsKCH/image5.png',
  'https://i.ibb.co/HTyM4CW/image6.png',
]

const User = ({ navigation }) => {
  const [image, setImage] = useState(null)
  useEffect(() => {
    const app = getFirebaseApp()
    const db = getDatabase(app)
    const auth = getAuth(app)
    const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID

    // Fetch user data from Firebase
    onValue(userRef, (snapshot) => {
      const data = snapshot.val()
      setName(data.fullName)
      setEmail(data.email)
      // Initialize Date of Birth and Country if they exist
      if (data.dateOfBirth) {
        setSelectedStartDate(data.dateOfBirth)
      }
      if (data.country) {
        setCountry(data.country)
      }
      if (data.profilePicture) {
        setSelectedImage({ uri: data.profilePicture }) // Use the ImgBB URL
        setImage({ uri: data.profilePicture })
      }
      if (data.profilePictureIndex !== undefined) {
        setSelectedImageIndex(data.profilePictureIndex)
        setSelectedImage(profileImages[data.profilePictureIndex])
      }
      if (data.profilePictureFromUser !== undefined) {
        setImage(data.profilePictureFromUser)
      }
    })
  }, [])

  const handleSaveChange = () => {
    const app = getFirebaseApp()
    const db = getDatabase(app)
    const auth = getAuth(app)
    const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID

    // Update user data in Firebase
    const updates = {
      fullName: name,
      email: email,
      dateOfBirth: selectedStartDate,
      country: country,
      profilePictureIndex: selectedImageIndex,
      profilePictureFromUser: image,
    }

    update(userRef, updates)
  }

  const [selectedImage, setSelectedImage] = useState(profileImages[0])
  const [selectedImageIndex, setSelectedImageIndex] = useState(Math.floor(Math.random() * profileImages.length))
  const [name, setName] = useState('Loading')
  const [email, setEmail] = useState('Loading')
  const [country, setCountry] = useState('Loading')
  const [showImagePicker, setShowImagePicker] = useState(false)

  const [openStartDatePicker, setOpenStartDatePicker] = useState(false)
  const today = new Date()
  const startDate = getFormatedDate(today.setDate(today.getDate() + 1), 'YYYY/MM/DD')
  const [selectedStartDate, setSelectedStartDate] = useState('01/01/1990')
  const [startedDate, setStartedDate] = useState('12/12/2023')

  const handleChangeStartDate = (propDate) => {
    setStartedDate(propDate)
  }

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker)
  }

  const handleImageSelection = (index) => {
    setSelectedImageIndex(index)
    const selectedImage = { uri: profileImages[index] } // Use an object with a uri property
    setSelectedImage(selectedImage)
    setImage(null) // Reset the uploaded image

    // Update profilePictureSource in Firebase
    const app = getFirebaseApp()
    const db = getDatabase(app)
    const auth = getAuth(app)
    const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID
    const updates = {
      profilePictureSource: 'default', // The user selected a default image
      profilePicture: profileImages[index], // Update the profile picture with the selected image URL
    }
    update(userRef, updates)
  }

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      // Upload the image to ImgBB
      let localUri = result.assets[0].uri
      let filename = localUri.split('/').pop()
      let match = /\.(\w+)$/.exec(filename)
      let type = match ? `image/${match[1]}` : `image`
      let formData = new FormData()
      formData.append('image', { uri: localUri, name: filename, type })
      let response = await fetch('https://api.imgbb.com/1/upload?key=711796b0bc4cdd0ba3694a4a28c2d7d8', {
        method: 'POST',
        body: formData,
        headers: {
          'content-type': 'multipart/form-data',
        },
      })
      let imgbbResponse = await response.json()

      // Save the ImgBB URL to Firebase Realtime Database
      const app = getFirebaseApp()
      const db = getDatabase(app)
      const auth = getAuth(app)
      const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID
      const updates = {
        profilePicture: imgbbResponse.data.url, // The ImgBB URL of the uploaded image
        profilePictureSource: 'uploaded',
      }
      update(userRef, updates)

      setSelectedImage({ uri: imgbbResponse.data.url })
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      <StatusBar animated={true} barStyle="dark-content" hidden={false} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 40,
          backgroundColor: COLORS.white,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 20,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={{ ...FONTS.h3 }}>{name}</Text>
        <View
          style={{
            position: 'absolute',
            right: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity style={{ marginRight: 15 }} onPress={() => navigation.navigate('EditProfile')}>
            <AntDesign name="edit" size={29} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('FriendsList')}>
            <MaterialIcons name="people-outline" size={35} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'rgba(238, 238, 238, 0.8)' }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: COLORS.white,
            width: '100%',
            paddingTop: 100,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderRadius: 20,
            marginTop: 100,
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: -95,
              left: '26%',
              borderRadius: '100%',
              borderWidth: 8,
              borderColor: 'rgba(238, 238, 238, 0.8)',
            }}
          >
            <TouchableOpacity style={{}}>
              {image ? (
                <Image
                  source={image}
                  style={{
                    height: 170,
                    width: 170,
                    borderRadius: 85,
                  }}
                />
              ) : (
                <Image
                  source={selectedImage}
                  style={{
                    height: 170,
                    width: 170,
                    borderRadius: 85,
                    borderWidth: 0,
                    borderColor: 'none',
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
          <Text
            style={{
              ...FONTS.h2,
            }}
          >
            {name}
          </Text>
          <View
            style={{
              width: '100%',
              marginTop: 20,
              flex: 1,
              gap: 5,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>
              Email : <Text style={{ ...FONTS.body3 }}>{email}</Text>
            </Text>
            <Text style={{ ...FONTS.h4 }}>
              Date of Birth : <Text style={{ ...FONTS.body3 }}>{selectedStartDate}</Text>
            </Text>
            <Text style={{ ...FONTS.h4 }}>
              Country : <Text style={{ ...FONTS.body3 }}>{country}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default User
