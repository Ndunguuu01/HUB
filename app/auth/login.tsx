import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSession } = useAuth();

  // ─── Graceful Auth Fallback ────────────────────────────────────
  // If no real Supabase URL is configured, inject a mock session
  // so the user can freely explore protected tabs.
  async function signInWithEmail() {
    setLoading(true);

    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://mock-url.supabase.co') {
      const mockUser = { id: 'mock-user-id', email: email || 'reader@bookhub.dev' };
      setSession({ user: mockUser, access_token: 'mock-token', refresh_token: 'mock-refresh' } as any);
      router.replace('/(tabs)/account');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert(error.message);
    else router.replace('/(tabs)/account');
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);

    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://mock-url.supabase.co') {
      const mockUser = { id: 'mock-user-id', email: email || 'reader@bookhub.dev' };
      setSession({ user: mockUser, access_token: 'mock-token', refresh_token: 'mock-refresh' } as any);
      router.replace('/(tabs)/account');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert(error.message);
    else Alert.alert('Check your email for the login link!');
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Enter your credentials, or press Sign In to continue as a guest.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A3A3A3"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A3A3A3"
          value={password}
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
        />

        <View style={styles.actions}>
          <Button
            title={loading ? "Loading…" : "Sign In"}
            onPress={signInWithEmail}
            disabled={loading}
            style={styles.btn}
          />
          <Button
            title="Sign Up"
            variant="secondary"
            onPress={signUpWithEmail}
            disabled={loading}
          />
        </View>
        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => router.back()}
          style={{marginTop: 24, borderWidth: 0}}
        />
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2D2C2A',
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'serif',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#2D2C2A',
    backgroundColor: '#FFFFFF',
    fontFamily: 'serif',
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  btn: {
    marginBottom: 0,
  },
});
