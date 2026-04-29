import React from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, isLoading, signInError } = useAuth();
  const [isSigning, setIsSigning] = React.useState(false);

  const handleSignIn = async () => {
    setIsSigning(true);
    try {
      await signIn();
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🛒</Text>
          <Text style={styles.appName}>Shop-o-matic</Text>
          <Text style={styles.tagline}>The smart household shopping list</Text>
        </View>

        <View style={styles.authContainer}>
          {signInError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{signInError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={isSigning}
            activeOpacity={0.8}
          >
            {isSigning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  authContainer: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  signInButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#635BFF',
    borderRadius: 12,
    height: 54,
  },
  signInButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
});
