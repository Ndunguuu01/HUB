import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { BookCard, Book } from '../../components/BookCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';

// ─── Fallback Library Data ─────────────────────────────────────────
const MOCK_LIBRARY: Book[] = [
  { id: '84',   title: 'Frankenstein',        author: 'Mary Shelley',  coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop', price: '0.00' },
  { id: '1342', title: 'Pride and Prejudice', author: 'Jane Austen',   coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop', price: '0.00' },
];

export default function LibraryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>(MOCK_LIBRARY);

  useEffect(() => {
    async function fetchLibrary() {
      if (!user) return;
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://mock-url.supabase.co') {
        setBooks(MOCK_LIBRARY);
        return;
      }

      const { data, error } = await supabase
        .from('purchases')
        .select('books(*)')
        .eq('user_id', user.id);

      if (data && !error) {
        const purchasedBooks = data.map((d: any) => d.books);
        setBooks(purchasedBooks);
      }
    }
    fetchLibrary();
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContent}>
          <Text style={styles.headerTitle}>Your Library</Text>
          <Text style={styles.subtitle}>Sign in to view your saved books.</Text>
          <Button title="Log In" onPress={() => router.push('/auth/login' as any)} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {books.map(book => (
          <View key={book.id} style={styles.gridItem}>
             <BookCard book={book} />
          </View>
        ))}
        {books.length === 0 && (
          <Text style={styles.subtitle}>No books in your library yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles: High-End Editorial ────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#737373',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
});
