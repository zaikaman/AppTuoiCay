import React from 'react';
import {
  StyleSheet,
  View,
  Text as RNText,
  Dimensions,
  Animated,
  Button,
  ImageBackground,
  Alert
} from 'react-native';
import { GestureHandler } from 'expo';
import * as d3Shape from 'd3-shape';
import color from 'randomcolor';
import { snap } from '@popmotion/popcorn';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path, G, Text, TSpan } from 'react-native-svg';
const { width } = Dimensions.get('screen');
import { getUserData, updateUserData } from '../utils/actions/userActions';
import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from '../utils/firebaseHelper';

const numberOfSegments = 12;
const wheelSize = width * 0.95;
const fontSize = 26;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;
const knobFill = color({ hue: 'purple' });
const wheelNumbers = [0.001, 0.002, 0.003, 0.004, 0.005, 0.05, 0.1, 0.25, 0.5, "1 FREE SPIN"];
const displayNumbers = ["🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁"];

const makeWheel = () => {
  const data = Array.from({ length: numberOfSegments }).fill(1);
  const arcs = d3Shape.pie()(data);
  const colors = color({
    luminosity: 'dark',
    count: numberOfSegments
  });

  return arcs.map((arc, index) => {
    const instance = d3Shape
      .arc()
      .padAngle(0.01)
      .outerRadius(width / 2)
      .innerRadius(20);

    return {
      path: instance(arc),
      color: colors[index],
      value: displayNumbers[index % displayNumbers.length], // Sử dụng displayNumbers ở đây
      displayValue: wheelNumbers[index % wheelNumbers.length], // Thêm dòng này
      centroid: instance.centroid(arc)
    };
  });
};

class Spin extends React.Component {
  constructor(props) {
    super(props);
    this.app = getFirebaseApp();
    this.auth = getAuth(this.app);
  }  
  _wheelPaths = makeWheel();
  _angle = new Animated.Value(0);
  angle = 0;

  state = {
    enabled: true,
    finished: false,
    winner: null,
    spinsLeft: 1, // Số lượt quay còn lại
    totalWatered: this.props.totalWatered, // Số tiền hiện có
  };

  async componentDidMount() {
    // Fetch user data from the database
    const userData = await getUserData(this.auth.currentUser.uid);
  
    // Update state with fetched user data
    this.setState({ 
      totalWatered: userData.totalWatered, 
      spinsLeft: userData.spinsLeft,
      // Add other fields as needed
    });
  
    this._angle.addListener(event => {
      if (this.state.enabled) {
        this.setState({
          enabled: false,
          finished: false
        });
      }
  
      this.angle = event.value;
    });
  }    

  componentDidUpdate(prevProps, prevState) {
    // Nếu totalWatered thay đổi, cập nhật state và cơ sở dữ liệu
    if (prevState.totalWatered !== this.state.totalWatered) {
      this.setState({ totalWatered: this.state.totalWatered });
      updateUserData(this.auth.currentUser.uid, { totalWatered: this.state.totalWatered });
    }
  
    // Nếu spinsLeft thay đổi, cập nhật cơ sở dữ liệu
    if (prevState.spinsLeft !== this.state.spinsLeft) {
      updateUserData(this.auth.currentUser.uid, { spinsLeft: this.state.spinsLeft });
    }
  
    // Nếu winner thay đổi, cập nhật totalWatered và spinsLeft
    if (prevState.winner !== this.state.winner) {
      const prize = this.state.winner;
      // Nếu người chơi thắng một lượt quay miễn phí
      if (prize === "1 FREE SPIN") {
        this.setState(prevState => ({ spinsLeft: prevState.spinsLeft + 1 }), () => {
          // Update spinsLeft in the database
          updateUserData(this.auth.currentUser.uid, { spinsLeft: this.state.spinsLeft });
        });
      } else {
        // If the player wins a prize other than a free spin
        if (!isNaN(prize)) {
          this.setState(prevState => ({ 
            totalWatered: prevState.totalWatered + prize,
            spinsLeft: prevState.spinsLeft - 1 // Decrease spinsLeft by 1
          }), () => {
            // Update totalWatered and spinsLeft in the database
            updateUserData(this.auth.currentUser.uid, { 
              totalWatered: this.state.totalWatered,
              spinsLeft: this.state.spinsLeft
            });
          });          
        }
      }
    }
  }    

  _getWinnerIndex = () => {
    const deg = Math.abs(Math.round(this.angle % oneTurn));
    // wheel turning counterclockwise
    if(this.angle < 0) {
      return Math.floor(deg / angleBySegment);
    }
    // wheel turning clockwise
    return (numberOfSegments - Math.floor(deg / angleBySegment)) % numberOfSegments;
};

  _onPan = ({ nativeEvent }) => {
    if (this.state.spinsLeft <= 0) {
      // Inform the user that they have no spins left
      Alert.alert("You have no spins left!");
      return;
    }
    if (nativeEvent.state === State.END) {
      const { velocityY } = nativeEvent;

      Animated.decay(this._angle, {
        velocity: velocityY / 1000,
        deceleration: 0.999,
        useNativeDriver: true
      }).start(() => {
        this._angle.setValue(this.angle % oneTurn);
        const snapTo = snap(oneTurn / numberOfSegments);
        Animated.timing(this._angle, {
          toValue: snapTo(this.angle),
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          const winnerIndex = this._getWinnerIndex();
          this.setState({
            enabled: true,
            finished: true,
            winner: this._wheelPaths[winnerIndex].displayValue // Sử dụng displayValue ở đây
          });
        });
        // do something here;
      });
    }
  };
  render() {
    const { totalWatered, spinsLeft } = this.state;
    return (
      <PanGestureHandler
        onHandlerStateChange={this._onPan}
        enabled={this.state.enabled}
      >
        <View style={styles.container}>
          <Text style={styles.totalWatered}>💰 {this.state.totalWatered}</Text>
          <Text style={styles.spinsLeft}>🔁 {this.state.spinsLeft}</Text> 
          {this._renderSvgWheel()}
          {this.state.finished && this.state.enabled && this._renderWinner()}
        </View>
      </PanGestureHandler>
    );
  }

  _renderKnob = () => {
    const knobSize = 30;
    // [0, numberOfSegments]
    const YOLO = Animated.modulo(
      Animated.divide(
        Animated.modulo(Animated.subtract(this._angle, angleOffset), oneTurn),
        new Animated.Value(angleBySegment)
      ),
      1
    );

    return (
      <Animated.View
        style={{
          width: knobSize,
          height: knobSize * 2,
          justifyContent: 'flex-end',
          zIndex: 1,
          transform: [
            {
              rotate: YOLO.interpolate({
                inputRange: [-1, -0.5, -0.0001, 0.0001, 0.5, 1],
                outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg']
              })
            }
          ]
        }}
      >
        <Svg
          width={knobSize}
          height={(knobSize * 100) / 57}
          viewBox={`0 0 57 100`}
          style={{ transform: [{ translateY: 8 }] }}
        >
          <Path
            d="M28.034,0C12.552,0,0,12.552,0,28.034S28.034,100,28.034,100s28.034-56.483,28.034-71.966S43.517,0,28.034,0z   M28.034,40.477c-6.871,0-12.442-5.572-12.442-12.442c0-6.872,5.571-12.442,12.442-12.442c6.872,0,12.442,5.57,12.442,12.442  C40.477,34.905,34.906,40.477,28.034,40.477z"
            fill={knobFill}
          />
        </Svg>
      </Animated.View>
    );
  };

  _renderWinner = () => {
    // Kiểm tra xem winner có phải là số hay không
    const isNumber = !isNaN(this.state.winner);
    let message = `You have won ${this.state.winner}!`;
    let totalWateredRounded = parseFloat(this.state.totalWatered).toFixed(4);
    
    // Nếu winner là số, thêm biểu tượng 💰 vào thông báo
    if (isNumber) {
      message = `You have won 💰${this.state.winner}!`;
    }
  
    // Tạo thông báo về số dư và số lượt quay còn lại
    const balanceMessage = `Your total balance is 💰${totalWateredRounded}!`;
    const spinsMessage = this.state.spinsLeft === 1 
      ? `You have 🔁${this.state.spinsLeft} spin left!` 
      : `You have 🔁${this.state.spinsLeft} spins left!`;
  
    return (
      <RNText style={styles.winnerText}>
        {message}
        {'\n'}
        {balanceMessage}
        {'\n'}
        {spinsMessage}
      </RNText>
    );
  };  

  _renderSvgWheel = () => {
    return (
      <View style={styles.container}>
        
        {this._renderKnob()}
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {
                rotate: this._angle.interpolate({
                  inputRange: [-oneTurn, 0, oneTurn],
                  outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`]
                })
              }
            ]
          }}
        >
          <Svg
            width={wheelSize}
            height={wheelSize}
            viewBox={`0 0 ${width} ${width}`}
            style={{ transform: [{ rotate: `-${angleOffset}deg` }] }}
          >
            <G y={width / 2} x={width / 2}>
              {this._wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const number = arc.value.toString();

                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path} fill={arc.color} />
                    <G
                      rotation={(i * oneTurn) / numberOfSegments + angleOffset}
                      origin={`${x}, ${y}`}
                    >
                      <Text
                        x={x}
                        y={y - 70}
                        fill="white"
                        textAnchor="middle"
                        fontSize={fontSize}
                      >
                        {Array.from({ length: number.length }).map((_, j) => {
                          return (
                            <TSpan
                              x={x}
                              dy={fontSize}
                              key={`arc-${i}-slice-${j}`}
                            >
                              {number.charAt(j)}
                            </TSpan>
                          );
                        })}
                      </Text>
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  totalWatered: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  spinsLeft: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  winnerText: {
    fontSize: 32,
    fontFamily: 'Roboto',
    position: 'absolute',
    bottom: 10,
  }
});

export default Spin;
