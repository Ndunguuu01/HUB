import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';

export default function SellerDashboard() {
  const router = useRouter();

  const mockSubmittedBooks = [
    { id: '1', title: 'The Silent Patient', status: 'Approved', sales: 124 },
    { id: '5', title: 'My New Novel', status: 'Pending', sales: 0 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Seller Dashboard</Text>
        <Button title="Submit New Book" onPress={() => router.push('/seller/submit')} />
      </View>
      
      <FlatList
        data={mockSubmittedBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookStats}>Sales: {item.sales}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'Approved' ? styles.bgGreen : styles.bgYellow]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 16, paddingTop: 48, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  bookTitle: { fontSize: 16, fontWeight: 'bold' },
  bookStats: { color: '#666', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bgGreen: { backgroundColor: '#dcfce7' },
  bgYellow: { backgroundColor: '#fef08a' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },
});
