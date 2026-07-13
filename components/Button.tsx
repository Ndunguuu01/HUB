import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[
        styles.text,
        variant === 'primary' ? styles.textPrimary : styles.textSecondary,
        textStyle,
      ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 4, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2D2C2A', 
    borderWidth: 1,
    borderColor: '#2D2C2A',
  },
  secondary: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1,
    borderColor: '#E5E5E5', 
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  textPrimary: {
    color: '#FDFBF7',
  },
  textSecondary: {
    color: '#2D2C2A', 
  },
});
