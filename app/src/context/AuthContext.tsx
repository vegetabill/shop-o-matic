import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { AuthState, AuthAction, User } from '../types';
import { exchangeGoogleToken, mockSignIn as mockSignInApi } from '../api/auth';
import { setOnUnauthorizedCallback } from '../api/client';
import {
  SECURE_STORE_JWT_KEY,
  SECURE_STORE_USER_KEY,
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
} from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue extends AuthState {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  mockSignIn: () => Promise<void>;
  signInError: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [signInError, setSignInError] = React.useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    restoreSession();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      const accessToken = response.authentication?.accessToken;
      const token = idToken ?? accessToken;
      if (token) {
        handleGoogleToken(token, !!idToken);
      } else {
        setSignInError('No token returned from Google');
      }
    } else if (response?.type === 'error') {
      setSignInError(response.error?.message ?? 'Sign-in failed. Please try again.');
    }
  }, [response]);

  const restoreSession = async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(SECURE_STORE_JWT_KEY),
        SecureStore.getItemAsync(SECURE_STORE_USER_KEY),
      ]);

      if (token && userJson) {
        const user: User = JSON.parse(userJson);
        dispatch({ type: 'SET_USER', payload: { user, token } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleGoogleToken = async (googleToken: string, isIdToken: boolean) => {
    try {
      const authResponse = await exchangeGoogleToken(googleToken, isIdToken);

      await Promise.all([
        SecureStore.setItemAsync(SECURE_STORE_JWT_KEY, authResponse.token),
        SecureStore.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(authResponse.user)),
      ]);

      dispatch({
        type: 'SET_USER',
        payload: { user: authResponse.user, token: authResponse.token },
      });
    } catch (error: any) {
      setSignInError(error.message ?? 'Sign-in failed. Please try again.');
    }
  };

  const signIn = useCallback(async () => {
    setSignInError(null);
    await promptAsync();
  }, [promptAsync]);

  const mockSignIn = useCallback(async () => {
    setSignInError(null);
    try {
      const authResponse = await mockSignInApi();
      await Promise.all([
        SecureStore.setItemAsync(SECURE_STORE_JWT_KEY, authResponse.token),
        SecureStore.setItemAsync(SECURE_STORE_USER_KEY, JSON.stringify(authResponse.user)),
      ]);
      dispatch({ type: 'SET_USER', payload: { user: authResponse.user, token: authResponse.token } });
    } catch (error: any) {
      setSignInError(error.message ?? 'Mock sign-in failed');
    }
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_STORE_JWT_KEY),
      SecureStore.deleteItemAsync(SECURE_STORE_USER_KEY),
    ]);
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  useEffect(() => {
    setOnUnauthorizedCallback(signOut);
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, mockSignIn, signInError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
