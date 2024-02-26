import React, { Component } from 'react'
import { View, Alert, Text, Image } from 'react-native'
import Leaderboard from 'react-native-leaderboard'
import { getFirebaseApp } from '../utils/firebaseHelper'
import { getDatabase, ref, onValue } from 'firebase/database'
import { getUserData } from '../utils/actions/userActions'

export default class AvatarAndClickable extends Component {
  state = {
    data: [],
  }

  componentDidMount() {
    const app = getFirebaseApp()
    const db = getDatabase(app)
    const usersRef = ref(db, 'users')

    onValue(usersRef, (snapshot) => {
      const users = snapshot.val()
      const data = []
      for (let id in users) {
        data.push({
          name: users[id].fullName,
          score: parseFloat(users[id].totalWatered).toFixed(4), // Làm tròn totalWatered
          iconUrl: users[id].profilePicture,
        })
      }
      this.setState({ data })
    })
  }

  alert = (title, body) => {
    Alert.alert(title, body, [{ text: 'OK', onPress: () => {} }], {
      cancelable: false,
    })
  }

  render() {
    const props = {
      labelBy: 'name',
      sortBy: 'score',
      data: this.state.data,
      icon: 'iconUrl',
      onRowPress: (item, index) => {
        this.alert(item.name + ' clicked', item.score + ' points, wow!')
      },
      evenRowColor: '#edfcf9',
      renderItem: (item, index) => {
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ width: 30, paddingVertical: 25 }}>{index + 1}</Text>
            <Image
              source={{ uri: item.iconUrl }}
              style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }}
            />
            <Text style={{ flex: 1 }}>{item.name}</Text>
            <Text>{item.score}</Text>
          </View>
        )
      },
    }

    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: 50,
            backgroundColor: 'black',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 30, color: 'white', paddingBottom: 10 }}>Leaderboard</Text>
        </View>
        <Leaderboard {...props} />
      </View>
    )
  }
}
