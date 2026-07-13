import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [pendingBooks, setPendingBooks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPendingBooks() {
      if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://mock-url.supabase.co') {
         setPendingBooks([
           { id: '5', title: 'My New Novel', author: 'Jane Doe', submittedAt: '2023-10-01' },
           { id: '6', title: 'Learn React Native', author: 'John Smith', submittedAt: '2023-10-02' }
         ]);
         return;
      }
      
      const { data, error } = await supabase.from('books').select('*').eq('status', 'Pending');
      if (data && !error) {
        setPendingBooks(data);
      }
    }
    fetchPendingBooks();
  }, []);

  const handleAction = async (id: string, action: 'Approve' | 'Reject') => {
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://mock-url.supabase.co') {
        Alert.alert(`${action}d (Mock)!`, `Book ${id} has been ${action.toLowerCase()}d locally.`);
        setPendingBooks(prev => prev.filter(b => b.id !== id));
        return;
    }

    const newStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    const { error } = await supabase.from('books').update({ status: newStatus }).eq('id', id);
    
    if (error) {
        Alert.alert('Error', error.message);
    } else {
        Alert.alert(`${action}d!`, `Book has been ${action.toLowerCase()}d.`);
        setPendingBooks(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Moderation</Text>
      </View>
      
      <FlatList
        data={pendingBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No pending books to review.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>by {item.author}</Text>
              <Text style={styles.date}>Submitted: {item.submittedAt}</Text>
            </View>
            <View style={styles.actions}>
              <Button title="Approve" onPress={() => handleAction(item.id, 'Approve')} style={styles.approveBtn} />
              <Button title="Reject" variant="secondary" onPress={() => handleAction(item.id, 'Reject')} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { padding: 16, paddingTop: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 16 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  info: { marginBottom: 16 },
  bookTitle: { fontSize: 18, fontWeight: 'bold' },
  bookAuthor: { fontSize: 14, color: '#475569', marginTop: 2 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  approveBtn: { flex: 1, backgroundColor: '#10b981' }, // Custom green for approve
});
