import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const { session, user, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color="#A3A3A3" />
        </View>

        {session ? (
          <>
            <Text style={styles.name}>{user?.email || 'Reader'}</Text>
            <Text style={styles.subtitle}>Active Reader</Text>

            <View style={styles.actions}>
              <Button title="Seller Dashboard" variant="secondary" style={styles.btn} onPress={() => router.push('/seller' as any)} />
              <Button title="Log Out" variant="primary" style={styles.btn} onPress={signOut} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.name}>Guest Reader</Text>
            <Text style={styles.subtitle}>Sign in to sync your reading progress</Text>

            <View style={styles.actions}>
              <Button
                title="Log In / Sign Up"
                variant="primary"
                style={styles.btn}
                onPress={() => router.push('/auth/login')}
              />
            </View>
          </>
        )}
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 32,
    fontFamily: 'serif',
  },
  actions: {
    width: '100%',
  },
  btn: {
    marginBottom: 16,
  },
});
