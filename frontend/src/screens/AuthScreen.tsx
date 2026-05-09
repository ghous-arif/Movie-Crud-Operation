import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ApiError, loginUser, registerUser } from '../api/movies';

type AuthScreenProps = {
  onLoginSuccess: () => void;
};

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('1234');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  async function handleAuth() {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isSignup) {
        await registerUser(username, password);
        setSuccessModalVisible(true);
      } else {
        await loginUser(username, password);
        onLoginSuccess();
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsSignup(!isSignup);
    setError('');
    setConfirmPassword('');
    setShowPassword(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={[styles.container, { flex: 1, justifyContent: 'center' }]}>
        <Text style={[styles.heading, { textAlign: 'center', marginBottom: 20 }]}>
          {isSignup ? 'Movie Library Signup' : 'Movie Library Login'}
        </Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8b8b8b"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#8b8b8b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={22} 
                color="#8b8b8b" 
              />
            </TouchableOpacity>
          </View>

          {isSignup && (
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#8b8b8b"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          )}

          <Pressable style={styles.primaryBtn} onPress={() => void handleAuth()} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.secondaryBtn, { marginTop: 10 }]} 
            onPress={toggleMode} 
            disabled={loading}
          >
            <Text style={[styles.secondaryText, { textAlign: 'center' }]}>
              {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </Text>
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={80} color="#d4af37" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Signup Successful!</Text>
            <Text style={styles.modalSub}>Your account has been created. You can now log in.</Text>
            <Pressable 
              style={styles.modalBtn} 
              onPress={() => {
                setSuccessModalVisible(false);
                setIsSignup(false);
              }}
            >
              <Text style={styles.modalBtnText}>Log In Now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0e0e0e' },
  container: { padding: 16, gap: 12 },
  heading: { color: '#d4af37', fontSize: 34, fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: '#2d2d2d',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#161616',
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: '#101010',
    fontSize: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#101010',
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  primaryBtn: {
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    backgroundColor: '#242424',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#404040',
  },
  secondaryText: { color: '#d4af37', fontWeight: '700' },
  error: {
    color: '#ff7f7f',
    borderColor: '#7d1d1d',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#2a1212',
    marginTop: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4af37',
    width: '90%',
  },
  modalTitle: {
    color: '#d4af37',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSub: {
    color: '#b1b1b1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  modalBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  },
});
