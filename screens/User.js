import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../constants";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getFirebaseApp } from "../utils/firebaseHelper";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { ref as sRef, put } from "firebase/storage";
import DatePicker, { getFormatedDate } from "react-native-modern-datepicker";
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import AddFr from "./AddFr";

const profileImages = [
  require("../assets/images/image1.png"),
  require("../assets/images/image2.png"),
  require("../assets/images/image3.png"),
  require("../assets/images/image4.png"),
  require("../assets/images/image5.png"),
  require("../assets/images/image6.png"),
];

const EditProfile = ({ navigation }) => {
  useEffect(() => {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const auth = getAuth(app);
    const userRef = ref(db, `users/${auth.currentUser.uid}`); // link with the current user ID

    // Fetch user data from Firebase
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      setName(data.fullName);
      setEmail(data.email);
      // Initialize Date of Birth and Country if they exist
      if (data.dateOfBirth) {
        setSelectedStartDate(data.dateOfBirth);
      }
      if (data.country) {
        setCountry(data.country);
      }
      if (data.profilePicture) {
        setSelectedImage(data.profilePicture);
      }
      if (data.profilePictureIndex !== undefined) {
        setSelectedImageIndex(data.profilePictureIndex);
        setSelectedImage(profileImages[data.profilePictureIndex]);
      }
      if(data.profilePictureFromUser !== undefined) {
        setImage(data.profilePictureFromUser)
      }
    });
  }, []);

  const handleSaveChange = () => {
    const app = getFirebaseApp();
    const db = getDatabase(app);
    const auth = getAuth(app);
    const userRef = ref(db, `users/${auth.currentUser.uid}`); // link with the current user ID

    // Update user data in Firebase
    const updates = {
      fullName: name,
      email: email,
      dateOfBirth: selectedStartDate,
      country: country,
      profilePictureIndex: selectedImageIndex,
      profilePictureFromUser : image,
    };

    update(userRef, updates);
  };

  const [selectedImage, setSelectedImage] = useState(profileImages[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(
    Math.floor(Math.random() * profileImages.length)
  );
  const [name, setName] = useState("Melissa Peters");
  const [email, setEmail] = useState("metperters@gmail.com");
  const [country, setCountry] = useState("Nigeria");
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate() + 1),
    "YYYY/MM/DD"
  );
  const [selectedStartDate, setSelectedStartDate] = useState("01/01/1990");
  const [startedDate, setStartedDate] = useState("12/12/2023");

  const handleChangeStartDate = (propDate) => {
    setStartedDate(propDate);
  };

  const handleOnPressStartDate = () => {
    setOpenStartDatePicker(!openStartDatePicker);
  };

  const handleImageSelection = (index) => {
    setSelectedImageIndex(index);
    const selectedImage = profileImages[index];
    setSelectedImage(selectedImage);
    setImage(null); 
  };  

  const [image, setImage] = useState(null)
  const handlePickImage = async ()=>{
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  // Modal FriendList
  const [modalVisible, setModalVisible] = useState(false)
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const openFriendList = () => {
    setModalVisible(true)
  }

  function renderDatePicker() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={openStartDatePicker}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              padding: 35,
              width: "90%",
              shadowColor: "#000",
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
                textHeaderColor: "#469ab6",
                textDefaultColor: COLORS.white,
                selectedTextColor: COLORS.white,
                mainColor: "#469ab6",
                textSecondaryColor: COLORS.white,
                borderColor: "rgba(122,146,165,0.1)",
              }}
            />

            <TouchableOpacity onPress={handleOnPressStartDate}>
              <Text style={{ ...FONTS.body3, color: COLORS.white }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 22,
      }}
    >
      <View
        style={{
          marginHorizontal: 12,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            left: 0,
          }}
        >
          <MaterialIcons
            name="keyboard-arrow-left"
            size={24}
            color={COLORS.black}
          />
        </TouchableOpacity>
        <Text style={{ ...FONTS.h3 }}>Edit Profile</Text>
      </View>
      <ScrollView style={{ padding: 10 }}>
        <View style={{ alignItems: "center", marginVertical: 22 }}>
          <TouchableOpacity onPress={() => setShowImagePicker(true)}>
            {image ? (
                <Image
                source={{uri : image}}
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
              source={selectedImage }
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
                position: "absolute",
                bottom: 0,
                right: 10,
              }}
            >
              <TouchableOpacity 
                  onPress={handlePickImage}>
                <MaterialIcons
                  name="photo-camera"
                  size={32}
                  color={COLORS.primary}
                />
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
            <View
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {profileImages.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      handleImageSelection(index);
                      setShowImagePicker(false);
                    }}
                  >
                    <Image
                      source={image}
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
              flexDirection: "column",
              marginBottom: 6,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>Name</Text>
            <View
              style={{
                height: 44,
                width: "100%",
                borderColor: COLORS.secondaryGray,
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: "center",
                paddingLeft: 8,
              }}
            >
              <TextInput
                value={name}
                onChangeText={(value) => setName(value)}
                editable={true}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "column",
              marginBottom: 6,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>Email</Text>
            <View
              style={{
                height: 44,
                width: "100%",
                borderColor: COLORS.secondaryGray,
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: "center",
                paddingLeft: 8,
              }}
            >
              <TextInput
                value={email}
                onChangeText={(value) => setEmail(value)}
                editable={true}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "column",
              marginBottom: 6,
            }}
          >
            <Text style={{ ...FONTS.h4 }}>Date of Birth</Text>
            <TouchableOpacity
              onPress={handleOnPressStartDate}
              style={{
                height: 44,
                width: "100%",
                borderColor: COLORS.secondaryGray,
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: "center",
                paddingLeft: 8,
              }}
            >
              <Text>{selectedStartDate}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            flexDirection: "column",
            marginBottom: 6,
          }}
        >
          <Text style={{ ...FONTS.h4 }}>Country</Text>
          <View
            style={{
              height: 44,
              width: "100%",
              borderColor: COLORS.secondaryGray,
              borderWidth: 1,
              borderRadius: 4,
              marginVertical: 6,
              justifyContent: "center",
              paddingLeft: 8,
            }}
          >
            <TextInput
              value={country}
              onChangeText={(value) => setCountry(value)}
              editable={true}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSaveChange}
          style={{
            backgroundColor: COLORS.primary,
            height: 44,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
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

        <View style = {{marginTop : 40}}>
            <TouchableOpacity 
                onPress = {openFriendList}
                style = {{ width : 40}}
            >
              <FontAwesome5 
                name = "user-friends"
                size = {30}
                color = {COLORS.black}
              />
            </TouchableOpacity>
        </View>


        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
          onBackdropPress={() => setModalVisible(false)}
          style={{ flex : 1, justifyContent : 'flex-start' }}
        >
          <View style={{ width: windowWidth * 1.5 / 3, height : (windowHeight), position : 'absolute', bottom : 0, left : -20, backgroundColor: COLORS.primary , paddingTop : 100 , alignItems : "center"}}>
              <Text style = {{ ...FONTS.h1 }}>List Friend</Text>
              <View style = {{marginTop : 10}}><AddFr/></View>
          </View>
        </Modal>      
         {renderDatePicker()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;