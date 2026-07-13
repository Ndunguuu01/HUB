import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

// ─── Book Type Definition ──────────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  price: string;
  genre?: string;
}

// ─── BookCard Component ────────────────────────────────────────────
// Renders a single book as a tappable card with cover, title & author.
// Navigates to the book detail screen on press.
export function BookCard({ book }: { book: Book }) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
      onPress={() => router.push(`/book/${book.id}` as any)}
    >
      <Image source={{ uri: book.coverUrl }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.author} numberOfLines={1}>{book.author}</Text>
      </View>
    </Pressable>
  );
}

// ─── Styles: High-End Editorial ────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  pressedCard: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  cover: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  info: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  author: {
    fontSize: 12,
    color: '#737373',
    fontFamily: 'serif',
  },
});
