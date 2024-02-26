import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, Dimensions, Button } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONTS } from '../constants'
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import { getDatabase, ref, onValue, update } from 'firebase/database'
import { getFirebaseApp } from '../utils/firebaseHelper'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { ref as sRef, put } from 'firebase/storage'
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker'
import * as ImagePicker from 'expo-image-picker'
import Modal from 'react-native-modal'

const profileImages = [
  'https://i.ibb.co/sjpJCcf/image1.png',
  'https://i.ibb.co/nmdz8gC/image2.png',
  'https://i.ibb.co/nzVxMcs/image3.png',
  'https://i.ibb.co/b2YZS61/image4.png',
  'https://i.ibb.co/5KCsKCH/image5.png',
  'https://i.ibb.co/HTyM4CW/image6.png',
]

const EditProfile = ({ navigation }) => {
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

  useEffect(() => {
    const app = getFirebaseApp()
    const db = getDatabase(app)
    const auth = getAuth(app)
    const userRef = ref(db, `users/${auth.currentUser.uid}`) // link with the current user ID

    // Set up a listener for the profilePicture field
    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val()
      if (data.profilePicture) {
        setSelectedImage({ uri: data.profilePicture }) // Use the ImgBB URL
      }
    })

    // Clean up the listener when the component is unmounted
    return unsubscribe
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

  const [image, setImage] = useState(null)
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

  function renderDatePicker() {
    return (
      <Modal animationType="slide" transparent={true} visible={openStartDatePicker}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              padding: 35,
              width: '90%',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <DatePicker
              mode="calendar"
              minimumDate={startDate}
              selected={startedDate}
              onDateChanged={handleChangeStartDate}
              onSelectedChange={(date) => setSelectedStartDate(date)}
              options={{
                backgroundColor: COLORS.primary,
                textHeaderColor: '#469ab6',
                textDefaultColor: COLORS.white,
                selectedTextColor: COLORS.white,
                mainColor: '#469ab6',
                textSecondaryColor: COLORS.white,
                borderColor: 'rgba(122,146,165,0.1)',
              }}
            />

            <TouchableOpacity onPress={handleOnPressStartDate}>
              <Text style={{ ...FONTS.body3, color: COLORS.white }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: 22,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: 30,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 0,
          }}
        >
          <MaterialIcons name="keyboard-arrow-left" size={34} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={{ ...FONTS.h3 }}>Edit Profile</Text>
      </View>
      <ScrollView style={{ padding: 10 }}>
        <View style={{ alignItems: 'center', marginVertical: 22 }}>
          <TouchableOpacity
            onPress={() => {
              console.log('Profile image pressed')
              setShowImagePicker(true)
            }}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={{
                  height: 170,
                  width: 170,
                  borderRadius: 85,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                }}
              />
            ) : (
              <Image
                source={selectedImage}
                style={{
                  height: 170,
                  width: 170,
                  borderRadius: 85,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                }}
              />
            )}

            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 10,
              }}
            >
              <TouchableOpacity onPress={handlePickImage}>
                <MaterialIcons name="photo-camera" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {showImagePicker && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showImagePicker}
            onRequestClose={() => setShowImagePicker(false)}
          >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {profileImages.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      handleImageSelection(index)
                      setShowImagePicker(false)
                    }}
                  >
                    <Image
                      source={{ uri: image }}
                      style={{
                        width: 100,
                        height: 100,
                        margin: 10,
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>
        )}

        <View>
          <View
            style={{
              flexDirection: 'column',
              marginBottom: 6,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>Name</Text>
            <View
              style={{
                height: 44,
                width: '100%',
                borderColor: COLORS.secondaryGray,
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: 'center',
                paddingLeft: 8,
              }}
            >
              <TextInput value={name} onChangeText={(value) => setName(value)} editable={true} />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              marginBottom: 6,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>Email</Text>
            <View
              style={{
                height: 44,
                width: '100%',
                borderColor: COLORS.secondaryGray,
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: 'center',
                paddingLeft: 8,
              }}
            >
              <TextInput value={email} onChangeText={(value) => setEmail(value)} editable={true} />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              marginBottom: 6,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>Date of Birth</Text>
            <TouchableOpacity
              onPress={handleOnPressStartDate}
              style={{
                height: 44,
                width: '100%',
                borderColor: COLORS.secondaryGray,
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: 'center',
                paddingLeft: 8,
              }}
            >
              <Text>{selectedStartDate}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'column',
            marginBottom: 6,
          }}
        >
          <Text style={{ ...FONTS.h4 }}>Country</Text>
          <View
            style={{
              height: 44,
              width: '100%',
              borderColor: COLORS.secondaryGray,
              borderWidth: 1,
              borderRadius: 4,
              marginVertical: 6,
              justifyContent: 'center',
              paddingLeft: 8,
            }}
          >
            <TextInput value={country} onChangeText={(value) => setCountry(value)} editable={true} />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSaveChange}
          style={{
            backgroundColor: COLORS.primary,
            height: 44,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              ...FONTS.body3,
              color: COLORS.white,
            }}
          >
            Save Change
          </Text>
        </TouchableOpacity>
        {renderDatePicker()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default EditProfile
