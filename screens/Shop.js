import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList, ScrollView } from 'react-native';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import images
import rabbitlvl1 from '../assets/images/rabbitlvl1.png';
import rabbitlvl2 from '../assets/images/rabbitlvl2.png';
import defaultImage from '../assets/images/x.png';
import { ShopContext } from './ShopContext';
import { getUserData, updateUserData } from '../utils/actions/userActions';
import { getAuth } from 'firebase/auth';

const images = {
  'Rabbit lv1 :\n +1% watering perfomance': rabbitlvl1,
  'Rabbit lv2 :\n +2% watering perfomance': rabbitlvl2,
};

const ShopItem = ({ item, onToggleAccept }) => (
  
  <View style={styles.itemContainer}>
    <Image 
      source={item.description && images[item.description] ? images[item.description] : defaultImage} 
      style={styles.itemImage} 
    />
    <Text style={styles.price}>{item.price}</Text>
    <Text style={styles.description}>{item.description}</Text>
    <Text style={styles.level}>Level {item.level}</Text>
    <ProgressBarAnimated
      width={120}
      value={item.progress}
      backgroundColorOnComplete="#6CC644"
      backgroundColor="#C0C0C0"
      height={8}
      borderRadius={5}
      style={styles.progressBar}
    />
    <TouchableOpacity
      style={[styles.button, item.accepted ? styles.buttonRemove : styles.buttonAccept]}
      onPress={() => onToggleAccept(item)}
    >
      <Text style={[styles.buttonText, item.accepted ? styles.buttonTextRemove : styles.buttonTextAccept]}>
        {item.accepted ? 'Remove' : 'Apply'}
      </Text>
    </TouchableOpacity>
  </View>
);

const Shop = () => {
  const { setSelectedItem } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('background');
  const [acceptedItems, setAcceptedItems] = useState({});
  const auth = getAuth();

  const tabData = {
    background: [
      { id: 1, price: '$10.00', description: 'Background 1 description', level: 1, progress: 50 },
      { id: 2, price: '$10.00', description: 'Background 2 description', level: 2, progress: 75 },
      { id: 3, price: '$20.00', description: 'Background 2 description', level: 3, progress: 3 },
      { id: 4, price: '$25.00', description: 'Background 2 description', level: 4, progress: 90 },
      { id: 5, price: '$30.00', description: 'Background 2 description', level: 5, progress: 40 },
      { id: 6, price: '$35.00', description: 'Background 2 description', level: 6, progress: 35 },
      { id: 7, price: '$40.00', description: 'Background 2 description', level: 7, progress: 10 },
    ],
    animals: [
      { id: 3, price: '$5.00', description: 'Rabbit lv1 :\n +1% watering perfomance', level: 1, progress: 80 },
      { id: 4, price: '$5.00', description: 'Rabbit lv2 :\n +2% watering perfomance', level: 1, progress: 80 },
      { id: 5, price: '$15.00', description: 'Snake lv1 :\n +4% watering perfomance', level: 3, progress: 40 },
      { id: 6, price: '$20.00', description: 'Snake lv2 :\n +8% watering perfomance', level: 4, progress: 30 },
      { id: 7, price: '$25.00', description: 'Bird lv1 :\n +10% watering perfomance', level: 5, progress: 20 },
      { id: 8, price: '$30.00', description: 'Bird lv2 :\n +12% watering perfomance', level: 6, progress: 15 },
      { id: 9, price: '$35.00', description: 'Elephant lv1 :\n +15% watering perfomance', level: 7, progress: 10 },
      { id: 10, price: '$40.00', description: 'Elephant lv2 :\n +20% watering perfomance', level: 8, progress: 5 },
    ],
    decorations: [
      { id: 5, price: '$12.00', description: 'Decoration 1 description', level: 1, progress: 40 },
      { id: 6, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
      { id: 7, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
      { id: 8, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
      { id: 9, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
      { id: 10, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
      { id: 11, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
      { id: 12, price: '$18.00', description: 'Decoration 2 description', level: 2, progress: 70 },
    ],
  };

  const renderTabs = () => (
    <FlatList
      data={Object.keys(tabData)}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: activeTab === item ? 'black' : 'white' }]}
          onPress={() => setActiveTab(item)}
        >
          {item === 'shop' ? (
            <Image source={require("../assets/images/shop.png")} style={styles.shopIcon} />
          ) : (
            <Text style={{ color: activeTab === item ? '#FFFFFF' : 'purple', textAlign: 'center' }}>{item}</Text>
          )}
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item}
    />
  );

  const onToggleAccept = async (item) => {
    // Create a copy of the accepted items
    let newAcceptedItems = { ...acceptedItems };
  
    // If the item is already accepted, remove it; otherwise, add it
    if (newAcceptedItems[activeTab]) {
      if (newAcceptedItems[activeTab] === item.id) {
        delete newAcceptedItems[activeTab];
  
        // If the active tab is 'animals' and the item id is 3 or 4, update the corresponding field in the database
        if (activeTab === 'animals' && (item.id === 3 || item.id === 4)) {
          const field = item.id === 3 ? 'Rabbitlvl1' : 'Rabbitlvl2';
          await updateUserData(auth.currentUser.uid, { [field]: 'No' });
        }
      } else {
        newAcceptedItems[activeTab] = item.id;
  
        // If the active tab is 'animals' and the item id is 3 or 4, update the corresponding field in the database
        if (activeTab === 'animals' && (item.id === 3 || item.id === 4)) {
          const field = item.id === 3 ? 'Rabbitlvl1' : 'Rabbitlvl2';
          await updateUserData(auth.currentUser.uid, { [field]: 'Yes' });
        }
      }
    } else {
      newAcceptedItems[activeTab] = item.id;
    }
  
    // Update the selected item
    setSelectedItem(item);
  
    // Update the state with the new accepted items
    setAcceptedItems(newAcceptedItems);
  };      

  const renderItem = ({ item }) => (
    <ShopItem
      key={item.id}
      item={{ ...item, accepted: acceptedItems[activeTab] === item.id }}
      onToggleAccept={onToggleAccept}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={styles.header}>
        <Image source={require("../assets/images/shop.png")} style={styles.shopIcon} />
        {renderTabs()}
      </View>
      <ScrollView>
        <View style={styles.container}>
          <FlatList
            data={tabData[activeTab]}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.itemsContainer}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'gray',
  },
  header: {
    width: width,
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  shopIcon: {
    width: width,
    height: 120,
    alignItems: 'center',
  },
  tabsContainer: {
    marginTop: 20,
    textAlign: 'center',
  },
  tab: {
    padding: 15,
    marginRight: 15,
    borderRadius: 10,
    marginTop: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  itemsContainer: {
    marginTop: 50,
    flexDirection: 'row', // Sắp xếp các vật phẩm theo chiều ngang
    flexWrap: 'wrap', // Cho phép các vật phẩm "đóng gói" vào hàng mới khi không đủ không gian
    justifyContent: 'center', // Canh giữa các hàng
  },
  itemContainer: {
    margin: 15,
    alignItems: 'center',
    borderColor: 'black', // Màu đường biên
    borderWidth: 3, // Kích thước đường biên
    borderRadius: 10, // Cong các góc để có góc bo
  },
  itemImage: {
    width: 150,
    height: 100,
    resizeMode: 'center',
  },
  price: {
    fontSize: 14,
    marginTop: 5,
  },
  description: {
    fontSize: 12,
    marginVertical: 3,
    textAlign: 'center',
  },
  level: {
    fontSize: 14,
    marginVertical: 3,
  },
  progressBar: {
    marginVertical: 5,
  },
  button: {
    marginVertical: 3,
    padding: 8,
    backgroundColor: '#6CC644',
    borderRadius: 5,
  },
  buttonAccept: {
    backgroundColor: '#6CC644',
  },
  buttonRemove: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'black', // Màu chữ mặc định
  },
  buttonTextAccept: {
    color: 'white', // Màu chữ khi chấp nhận
  },
  buttonTextRemove: {
    color: 'black', // Màu chữ khi loại bỏ
  },
});

export default Shop;
