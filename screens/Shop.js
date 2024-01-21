import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList, ScrollView } from 'react-native';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import images
import rabbitlvl1 from '../assets/images/rabbitlvl1.png';
import rabbitlvl2 from '../assets/images/rabbitlvl2.png';
import foxlvl1 from '../assets/images/foxlvl1.png';
import foxlvl2 from '../assets/images/foxlvl2.png';
import birdlvl1 from '../assets/images/birdlvl1.png';
import birdlvl2 from '../assets/images/birdlvl2.png';
import monkeylvl1 from '../assets/images/monkeylvl1.png';
import monkeylvl2 from '../assets/images/monkeylvl2.png';
import elephantlvl1 from '../assets/images/elephantlvl1.png';
import elephantlvl2 from '../assets/images/elephantlvl2.png';
import horselvl1 from '../assets/images/horselvl1.png';
import horselvl2 from '../assets/images/horselvl2.png';
import wolflvl1 from '../assets/images/wolflvl1.png';
import wolflvl2 from '../assets/images/wolflvl2.png';
import background1 from '../assets/images/background1.png';
import background2 from '../assets/images/background2.png';
import background3 from '../assets/images/background3.png';
import background4 from '../assets/images/background4.png';
import background5 from '../assets/images/background5.png';
import background6 from '../assets/images/background6.png';
import waiting from '../assets/images/waiting.png';
import defaultImage from '../assets/images/x.png';
import { ShopContext } from './ShopContext';
import { getUserData, updateUserData } from '../utils/actions/userActions';
import { getAuth } from 'firebase/auth';

const images = {
  'Rabbit lv1 :\n +1% watering perfomance': rabbitlvl1,
  'Rabbit lv2 :\n +2% watering perfomance': rabbitlvl2,
  'Fox lv1 :\n +3% watering perfomance' :foxlvl1,  
  'Fox lv2 :\n +5% watering perfomance' :foxlvl2,
  'Bird lv1 :\n +7% watering perfomance':birdlvl1,
  'Bird lv2 :\n +10% watering perfomance': birdlvl2,
  'Monkey lv2 :\n +13% watering perfomance':monkeylvl1, 
  'Monkey lv2 :\n +17% watering perfomance':monkeylvl2,
  'Elephant lv1 :\n +21% watering perfomance':elephantlvl1,
  'Elephant lv2 :\n +26% watering perfomance':elephantlvl2,      
  'Horse lv1 :\n +31% watering perfomance':horselvl1,      
  'Horse lv2 :\n +37% watering perfomance':horselvl2,
  'Wolf lv2 :\n +43% watering perfomance':wolflvl1,      
  'Wolf lv2 :\n +50% watering perfomance':wolflvl2,
  'Background 1':background1,
  'Background 2':background2,
  'Background 3':background3,
  'Background 4':background4,
  'Background 5':background5,
  'Background 6':background6,
};

const ShopItem = ({ item, onToggleAccept }) => (
  
  <View style={styles.itemContainer}>
    <Image 
      source={item.description && images[item.description] ? images[item.description] : waiting} 
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
      { id: 1, price: '$10.00', description: 'Background 1', level: 1, progress: 50 },
      { id: 2, price: '$10.00', description: 'Background 2', level: 2, progress: 75 },
      { id: 3, price: '$20.00', description: 'Background 3', level: 3, progress: 3 },
      { id: 4, price: '$25.00', description: 'Background 4', level: 4, progress: 90 },
      { id: 5, price: '$30.00', description: 'Background 5', level: 5, progress: 40 },
      { id: 6, price: '$35.00', description: 'Background 6', level: 6, progress: 35 },
    ],
    animals: [
      { id: 3, price: '$5.00', description: 'Rabbit lv1 :\n +1% watering perfomance', level: 1, progress: 88 },
      { id: 4, price: '$5.00', description: 'Rabbit lv2 :\n +2% watering perfomance', level: 1, progress: 80 },
      { id: 5, price: '$15.00', description: 'Fox lv1 :\n +3% watering perfomance', level: 3, progress: 75 },
      { id: 6, price: '$20.00', description: 'Fox lv2 :\n +5% watering perfomance', level: 4, progress: 69 },
      { id: 7, price: '$25.00', description: 'Bird lv1 :\n +7% watering perfomance', level: 5, progress: 65 },
      { id: 8, price: '$30.00', description: 'Bird lv2 :\n +10% watering perfomance', level: 6, progress: 50 },
      { id: 9, price: '$70.00', description: 'Monkey lv2 :\n +13% watering perfomance', level: 11, progress: 52 }, 
      { id: 10, price: '$70.00', description: 'Monkey lv2 :\n +17% watering perfomance', level: 11, progress: 99 }, 
      { id: 11, price: '$35.00', description: 'Elephant lv1 :\n +21% watering perfomance', level: 7, progress: 40 },
      { id: 12, price: '$40.00', description: 'Elephant lv2 :\n +26% watering perfomance', level: 8, progress: 35 },      
      { id: 13, price: '$50.00', description: 'Horse lv1 :\n +31% watering perfomance', level: 9, progress: 30 },      
      { id: 14, price: '$60.00', description: 'Horse lv2 :\n +37% watering perfomance', level: 10, progress: 20 },
      { id: 15, price: '$70.00', description: 'Wolf lv2 :\n +43% watering perfomance', level: 11, progress: 10 },      
      { id: 16, price: '$80.00', description: 'Wolf lv2 :\n +50% watering perfomance', level: 12, progress: 3 },
    ],
    decorations: [
      { id: 5, price: '$12.00', description: 'Decoration 1', level: 1, progress: 40 },
      { id: 6, price: '$18.00', description: 'Decoration 2', level: 2, progress: 70 },
      { id: 7, price: '$18.00', description: 'Decoration 3', level: 2, progress: 70 },
      { id: 8, price: '$18.00', description: 'Decoration 4', level: 2, progress: 70 },
      { id: 9, price: '$18.00', description: 'Decoration 5', level: 2, progress: 70 },
      { id: 10, price: '$18.00', description: 'Decoration 6', level: 2, progress: 70 },
      { id: 11, price: '$18.00', description: 'Decoration 7', level: 2, progress: 70 },
      { id: 12, price: '$18.00', description: 'Decoration 8', level: 2, progress: 70 },
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

    if (newAcceptedItems[item.id]) {
      if (newAcceptedItems[item.id].accepted) {
        newAcceptedItems[item.id].accepted = false;
      } else {
        newAcceptedItems[item.id].accepted = true;
      }
    } else {
      newAcceptedItems[item.id] = { tab: activeTab, accepted: true };
    }
  
    // If the item is already accepted, remove it; otherwise, add it
    if (newAcceptedItems[activeTab]) {
      if (newAcceptedItems[activeTab] === item.id) {
        delete newAcceptedItems[activeTab];
  
        // If the active tab is 'animals' and the item id is 3 or 4, update the corresponding field in the database
        if (activeTab === 'animals' && item.id === 3) {
          await updateUserData(auth.currentUser.uid, { Rabbitlvl1: 'No', Rabbitlvl1Applied: 'No' });
        } else if (activeTab === 'animals' && item.id === 4) {
          await updateUserData(auth.currentUser.uid, { Rabbitlvl2: 'No', Rabbitlvl2Applied: 'No' });
        }
      } else {
        newAcceptedItems[activeTab] = item.id;
  
        // If the active tab is 'animals' and the item id is 3 or 4, update the corresponding field in the database
        if (activeTab === 'animals' && item.id === 3) {
          await updateUserData(auth.currentUser.uid, { Rabbitlvl1: 'Yes', Rabbitlvl1Applied: 'Yes' });
        } else if (activeTab === 'animals' && item.id === 4) {
          await updateUserData(auth.currentUser.uid, { Rabbitlvl2: 'Yes', Rabbitlvl2Applied: 'Yes' });
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
      item={{
        ...item,
        accepted: acceptedItems[item.id] ? acceptedItems[item.id].accepted : false,
      }}
      onToggleAccept={onToggleAccept}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={styles.header}>
        <Image source={require("../assets/images/shop2.png")} style={styles.shopIcon} />
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
