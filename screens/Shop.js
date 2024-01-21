import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList, ScrollView } from 'react-native';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import { SafeAreaView } from 'react-native-safe-area-context';

const ShopItem = ({ item, onToggleAccept }) => (
  <View style={styles.itemContainer}>
    <Image source={require("../assets/images/animal2.png")} style={styles.itemImage} />
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
        {item.accepted ? 'Remove' : 'Accept'}
      </Text>
    </TouchableOpacity>
  </View>
);

const Shop = () => {
  const [activeTab, setActiveTab] = useState('background');
  const [acceptedItems, setAcceptedItems] = useState({});

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
      { id: 3, price: '$5.00', description: 'Thỏ lv1 : Tăng 2% hiệu suất', level: 1, progress: 80, image: 'animal1.png' },
      { id: 3, price: '$5.00', description: 'Thỏ lv2 : Tăng 2% hiệu suất', level: 1, progress: 80, image: 'animal2.png' },
      { id: 5, price: '$15.00', description: 'Rắn lv1 : Tăng 8% hiệu suất', level: 3, progress: 40 },
      { id: 6, price: '$20.00', description: 'Rắn lv2 : Tăng 12% hiệu suất', level: 4, progress: 30 },
      { id: 7, price: '$25.00', description: 'Chim lv1 : Tăng 16% hiệu suất', level: 5, progress: 20 },
      { id: 8, price: '$30.00', description: 'Chim lv2 : Tăng 21% hiệu suất', level: 6, progress: 15 },
      { id: 9, price: '$35.00', description: 'Voi lv1 : Tăng 26% hiệu suất', level: 7, progress: 10 },
      { id: 10, price: '$40.00', description: 'Voi lv2 : Tăng 32% hiệu suất', level: 8, progress: 5 },
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

  const onToggleAccept = (item) => {
    const newAcceptedItems = { ...acceptedItems };

    // If the item is already accepted, remove it; otherwise, add it
    if (newAcceptedItems[activeTab]) {
      if (newAcceptedItems[activeTab] === item.id) {
        delete newAcceptedItems[activeTab];
      } else {
        newAcceptedItems[activeTab] = item.id;
      }
    } else {
      newAcceptedItems[activeTab] = item.id;
    }

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
