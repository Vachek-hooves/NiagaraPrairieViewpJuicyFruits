import React from 'react';
import {useEffect, useState, useRef} from 'react';
import {
  ImageBackground,
  ActivityIndicator,
  Animated,
  View,
  Dimensions,
} from 'react-native';

const slider1 = require('../../../src/assets/loader/Slice1.png');
const slider2 = require('../../../src/assets/loader/Slice2.png');

const {width: screenWidth} = Dimensions.get('window');

const CustomeWelcome = props => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideAnim1 = useRef(new Animated.Value(0)).current;
  const slideAnim2 = useRef(new Animated.Value(screenWidth)).current;

  const images = [slider1, slider2];

  useEffect(() => {
    // Wait 2 seconds, then slide to second image
    const timer = setTimeout(() => {
      // Animate current image out (slide left)
      Animated.timing(slideAnim1, {
        toValue: -screenWidth,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      // Animate second image in (slide from right)
      slideAnim2.setValue(screenWidth);
      Animated.timing(slideAnim2, {
        toValue: 0,
        duration: 1600,
        useNativeDriver: true,
      }).start(() => {
        // Keep the second image visible permanently
        setCurrentImageIndex(1);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [slideAnim1, slideAnim2]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (props.onWelcomeComplete) {
  //       props.onWelcomeComplete();
  //     }
  //   }, 5000);
  //   return () => clearTimeout(timer);
  // }, [props.onWelcomeComplete]);

  return (
    <View style={{width: '100%', height: '100%', backgroundColor: '#010518ff'}}>
      {/* Current Image */}
      <Animated.View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: [{translateX: slideAnim1}],
        }}>
        <ImageBackground
          source={images[currentImageIndex]}
          style={{width: '100%', height: '100%', justifyContent: 'center'}}>
          <ActivityIndicator color="gold" size="large" />
        </ImageBackground>
      </Animated.View>

      {/* Second Image (slides in from right) */}
      <Animated.View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: [{translateX: slideAnim2}],
        }}>
        <ImageBackground
          source={images[1]}
          style={{width: '100%', height: '100%', justifyContent: 'center'}}>
          <ActivityIndicator color="gold" size="large" />
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

export default CustomeWelcome;
