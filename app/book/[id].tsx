import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// ─── Book Metadata Lookup ──────────────────────────────────────────
// Maps Gutenberg IDs to their real metadata so the detail page is accurate.
const BOOK_META: Record<string, { title: string; author: string; synopsis: string; coverUrl: string }> = {
  '84':    { title: 'Frankenstein',        author: 'Mary Shelley',       synopsis: 'Victor Frankenstein, a young scientist, creates a sapient creature in an unorthodox experiment. Horrified by what he has made, he abandons his creation — setting into motion a chain of events that will bring tragedy to everyone he holds dear.', coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop' },
  '1342':  { title: 'Pride and Prejudice', author: 'Jane Austen',        synopsis: 'The Bennet family navigates love, class, and misunderstanding in Regency-era England. At its center, the spirited Elizabeth Bennet and the proud Mr. Darcy must overcome their own prejudices to find happiness.', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop' },
  '11':    { title: 'Alice in Wonderland', author: 'Lewis Carroll',      synopsis: 'A young girl named Alice tumbles down a rabbit hole into a fantastical underground world populated by peculiar creatures. Her journey through Wonderland is a whimsical exploration of logic, identity, and nonsense.', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop' },
  '2701':  { title: 'Moby Dick',           author: 'Herman Melville',    synopsis: 'Captain Ahab leads his crew on an obsessive quest across the oceans to hunt the great white whale, Moby Dick — the creature that took his leg. A sweeping allegory of obsession, fate, and the sea.', coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop' },
  '1661':  { title: 'Sherlock Holmes',     author: 'Arthur Conan Doyle', synopsis: 'The world\'s most famous consulting detective, Sherlock Holmes, and his loyal companion Dr. Watson investigate a string of bizarre cases across Victorian London, using deduction and forensic science.', coverUrl: 'https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?q=80&w=400&auto=format&fit=crop' },
  '4300':  { title: 'Ulysses',             author: 'James Joyce',        synopsis: 'A single day in Dublin - June 16, 1904 - unfolds through the wanderings of Leopold Bloom. Joyce\'s landmark novel reimagines Homer\'s Odyssey in stream-of-consciousness prose.', coverUrl: 'https://images.unsplash.com/photo-1542871793-fd7e2b3ce8fb?q=80&w=400&auto=format&fit=crop' },
  '16328': { title: 'Beowulf',             author: 'Anonymous',          synopsis: 'The earliest surviving long poem in Old English. A heroic warrior named Beowulf sails to Denmark to slay the monstrous Grendel, then returns to his homeland to face an ancient dragon.', coverUrl: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?q=80&w=400&auto=format&fit=crop' },
  '36':    { title: 'War of the Worlds',   author: 'H. G. Wells',        synopsis: 'Martian invaders land in the English countryside, unleashing devastating heat-ray weapons upon a helpless humanity. A pioneering work of science fiction that explores fear, survival, and the fragility of civilization.', coverUrl: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=400&auto=format&fit=crop' },
};

const getFallback = (id: string) => ({
  title: 'Classic Literature',
  author: 'Public Domain',
  synopsis: 'A treasured work of classic literature from Project Gutenberg.',
  coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
});

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const meta = BOOK_META[id as string] || getFallback(id as string);

  const [book, setBook] = useState({
    id: id as string,
    ...meta,
    price: '0.00',
    language: 'English',
  });

  useEffect(() => {
    async function fetchBook() {
      if (process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_URL !== 'YOUR_SUPABASE_URL' && process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://mock-url.supabase.co') {
        const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
        if (data && !error) setBook(data);
      }
    }
    fetchBook();
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      import('react-native').then(({ Alert }) => {
        Alert.alert('Login Required', 'Sign in to add books to your library.');
      });
      return;
    }
    // Mock purchase success
    import('react-native').then(({ Alert }) => {
      Alert.alert('Added to Library', `"${book.title}" is now in your library.`, [
        { text: 'Read Now', onPress: () => router.push(`/reader/${book.id}` as any) },
      ]);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* ─── Header ──────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#2D2C2A" />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="heart-outline" size={24} color="#2D2C2A" />
          </Pressable>
        </View>

        {/* ─── Cover & Meta ────────────────────────────────────── */}
        <View style={styles.coverSection}>
          <Image source={{ uri: book.coverUrl }} style={styles.cover} />
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}><Text style={styles.badgeText}>{book.language}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Free</Text></View>
          </View>
        </View>

        {/* ─── Actions ──────────────────────────────────────────── */}
        <View style={styles.actions}>
          <Button
            title="Read Online"
            variant="primary"
            style={styles.actionBtn}
            onPress={() => router.push(`/reader/${book.id}` as any)}
          />
          <Button
            title="Add to Library"
            variant="secondary"
            style={styles.actionBtn}
            onPress={handlePurchase}
          />
        </View>

        {/* ─── Synopsis ────────────────────────────────────────── */}
        <View style={styles.synopsisSection}>
          <Text style={styles.synopsisHeading}>Synopsis</Text>
          <Text style={styles.synopsisText}>{book.synopsis}</Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48,
  },
  iconBtn: {
    padding: 8,
  },
  coverSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: 4,
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  author: {
    fontSize: 16,
    color: '#737373',
    marginBottom: 16,
    fontFamily: 'serif',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  badgeText: {
    fontSize: 12,
    color: '#737373',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  actions: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  actionBtn: {
    marginBottom: 12,
  },
  synopsisSection: {
    padding: 24,
  },
  synopsisHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  synopsisText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#525252',
    fontFamily: 'serif',
  },
});
