import React from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, mockSignIn, isLoading, signInError } = useAuth();
  const [isSigning, setIsSigning] = React.useState(false);

  const handleMockSignIn = async () => {
    setIsSigning(true);
    try {
      await mockSignIn();
    } finally {
      setIsSigning(false);
    }
  };

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
            style={styles.googleButton}
            onPress={handleSignIn}
            disabled={isSigning}
            activeOpacity={0.8}
          >
            {isSigning ? (
              <ActivityIndicator size="small" color="#1C1C1E" />
            ) : (
              <>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>

          {__DEV__ && (
            <TouchableOpacity
              style={styles.mockButton}
              onPress={handleMockSignIn}
              disabled={isSigning}
              activeOpacity={0.8}
            >
              <Text style={styles.mockButtonText}>Dev Sign In (skip Google)</Text>
            </TouchableOpacity>
          )}
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    height: 54,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  mockButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
  },
  mockButtonText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
