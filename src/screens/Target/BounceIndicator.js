import { View, StyleSheet, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';

const BounceIndicator = ({
  size = 18,
  color = '#FB8609',
  count = 5,
  containerStyle,
  circleStyle,
}) => {
  // Create animated values for each circle
  const animatedValues = useRef(
    Array.from({ length: count }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Create staggered bounce animations for each circle
    const animations = animatedValues.map((animValue, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 600,
            delay: index * 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
    });

    // Start all animations
    Animated.parallel(animations).start();

    return () => {
      // Cleanup animations on unmount
      animations.forEach((anim) => anim.stop());
    };
  }, []);

  // Interpolate animation values for bounce effect
  const getCircleStyle = (index) => {
    const translateY = animatedValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });

    const scale = animatedValues[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.2, 1],
    });

    const opacity = animatedValues[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1, 0.5],
    });

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  };

  // Generate colors with gradient effect
  const getCircleColor = (index) => {
    const colors = [
      '#FB8609', // Orange
      '#FFA64D', // Light Orange
      '#7696CA', // Light Blue
      '#5A7BA8', // Medium Blue
      '#FB8609', // Orange (repeat)
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {animatedValues.map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: getCircleColor(index),
            },
            getCircleStyle(index),
            circleStyle,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    // paddingVertical: 20,
    // paddingHorizontal: 20,
    // backgroundColor: 'red',
    backgroundColor: '#000000',
    position: 'absolute',
    height: '110%',
    width: '100%',
  },
  circle: {},
});

export default BounceIndicator;
