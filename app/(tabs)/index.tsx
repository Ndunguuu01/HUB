import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookCard, Book } from '../../components/BookCard';
import { supabase } from '../../lib/supabase';

// ─── Book Catalog ─────────────────────────────────────────────────
// Each ID maps to a real Project Gutenberg text file in public/books/
const MOCK_BOOKS: Book[] = [
  { id: '84',    title: 'Frankenstein',         author: 'Mary Shelley',         coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Sci-Fi' },
  { id: '1342',  title: 'Pride and Prejudice',  author: 'Jane Austen',          coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Romance' },
  { id: '11',    title: 'Alice in Wonderland',  author: 'Lewis Carroll',        coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Fantasy' },
  { id: '2701',  title: 'Moby Dick',            author: 'Herman Melville',      coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Fiction' },
  { id: '1661',  title: 'Sherlock Holmes',       author: 'Arthur Conan Doyle',   coverUrl: 'https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Mystery' },
  { id: '4300',  title: 'Ulysses',              author: 'James Joyce',          coverUrl: 'https://images.unsplash.com/photo-1542871793-fd7e2b3ce8fb?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Fiction' },
  { id: '16328', title: 'Beowulf',              author: 'Anonymous',            coverUrl: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Fantasy' },
  { id: '36',    title: 'War of the Worlds',    author: 'H. G. Wells',          coverUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=400&auto=format&fit=crop', price: '0.00', genre: 'Sci-Fi' },
];

const GENRES = ['All', 'Fiction', 'Sci-Fi', 'Romance', 'Mystery', 'Fantasy'];

export default function HomeScreen() {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  useEffect(() => {
    async function fetchBooks() {
      if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        const { data, error } = await supabase.from('books').select('*');
        if (data && !error) setBooks(data);
      }
    }
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || b.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* ─── Header & Search ──────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.logo}>BookHub</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#A3A3A3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search titles, authors…"
              placeholderTextColor="#A3A3A3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
               <Pressable onPress={() => setSearchQuery('')}>
                 <Ionicons name="close-circle" size={18} color="#A3A3A3" />
               </Pressable>
            )}
          </View>
        </View>

        {searchQuery.length > 0 ? (
          /* ─── Search Results Mode ──────────────────────────────── */
          <View style={styles.searchResults}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {filteredBooks.length > 0 ? (
              <View style={styles.grid}>
                {filteredBooks.map(book => (
                   <View key={book.id} style={styles.gridItem}>
                     <BookCard book={book} />
                   </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color="#D4D4D4" />
                <Text style={styles.emptyStateText}>No books found for "{searchQuery}"</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* ─── Hero Section ──────────────────────────────────── */}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Free Classic Literature</Text>
              <Text style={styles.heroSubtitle}>Read the world's greatest public-domain books, instantly.</Text>
            </View>

            {/* ─── Genre Filter ──────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                {GENRES.map((genre) => (
                  <Pressable
                    key={genre}
                    style={[styles.genreBadge, selectedGenre === genre && styles.genreBadgeActive]}
                    onPress={() => setSelectedGenre(genre)}
                  >
                    <Text style={[styles.genreText, selectedGenre === genre && styles.genreTextActive]}>{genre}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* ─── Featured Books ────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured Books</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookScroll}>
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </ScrollView>
            </View>

            {/* ─── New Arrivals ──────────────────────────────────── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bookScroll}>
                {filteredBooks.slice().reverse().map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </ScrollView>
            </View>
            <View style={{height: 40}} />
          </>
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
    padding: 24,
    paddingTop: 56,
    backgroundColor: '#FDFBF7',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2C2A',
    fontFamily: 'serif',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  hero: {
    marginHorizontal: 24,
    padding: 28,
    backgroundColor: '#2D2C2A',
    borderRadius: 4,
    marginBottom: 28,
  },
  heroTitle: {
    color: '#FDFBF7',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  heroSubtitle: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'serif',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2C2A',
    marginHorizontal: 24,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  genreScroll: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  genreBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: 12,
  },
  genreBadgeActive: {
    backgroundColor: '#2D2C2A',
    borderColor: '#2D2C2A',
  },
  genreText: {
    color: '#737373',
    fontWeight: '600',
    fontFamily: 'serif',
    fontSize: 14,
  },
  genreTextActive: {
    color: '#FDFBF7',
  },
  bookScroll: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  searchResults: {
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 15,
    color: '#A3A3A3',
    fontWeight: '500',
    fontFamily: 'serif',
  },
});