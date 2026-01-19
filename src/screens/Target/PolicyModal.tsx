import React from 'react';
import {View, Text, Pressable, StyleSheet, Dimensions} from 'react-native';

const {height} = Dimensions.get('window');

interface PolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({visible, onClose}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={({pressed}) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onClose}
        android_ripple={{color: 'rgba(255, 255, 255, 0.2)'}}>
        <Text style={styles.buttonText}>Accept Privacy Policy</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: height * 0.1,
    height: height * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#0056CC',
    transform: [{scale: 0.98}],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default PolicyModal;
