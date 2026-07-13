import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function SubmitBookScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !author) {
      Alert.alert('Error', 'Title and Author are required');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit a book.');
      return;
    }

    setLoading(true);

    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://mock-url.supabase.co') {
      Alert.alert('Success (Mock)', 'Book submitted to local mock storage!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('books').insert({
      title,
      author,
      price: price ? parseFloat(price) : 0,
      synopsis,
      seller_id: user.id,
      status: 'Pending',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Book submitted for review!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Submit New Book</Text>
      </View>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Dune" />

        <Text style={styles.label}>Author</Text>
        <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="e.g. Frank Herbert" />

        <Text style={styles.label}>Price (USD)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. 9.99 (Leave 0 for free)" keyboardType="numeric" />

        <Text style={styles.label}>Synopsis</Text>
        <TextInput style={[styles.input, styles.textArea]} value={synopsis} onChangeText={setSynopsis} multiline numberOfLines={4} placeholder="What is the book about?" />

        <View style={styles.uploadGroup}>
          <Button title="Upload Cover Image" variant="secondary" style={styles.uploadBtn} onPress={() => {}} />
          <Button title="Upload EPUB File" variant="secondary" style={styles.uploadBtn} onPress={() => {}} />
        </View>

        <Button title={loading ? "Submitting..." : "Submit for Review"} onPress={handleSubmit} disabled={loading} style={styles.submitBtn} />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} style={{borderWidth: 0}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: 48, borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  form: { padding: 24 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  uploadGroup: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  uploadBtn: { flex: 1 },
  submitBtn: { marginBottom: 12 }
});
