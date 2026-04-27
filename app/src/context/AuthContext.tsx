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
import {
  useAutoDiscovery,
  useAuthRequest,
  exchangeCodeAsync,
  makeRedirectUri,
} from 'expo-auth-session';
import { AuthState, AuthAction, User } from '../types';
import { exchangeAuth0Token, mockSignIn as mockSignInApi } from '../api/auth';
import { setOnUnauthorizedCallback } from '../api/client';
import {
  SECURE_STORE_JWT_KEY,
  SECURE_STORE_USER_KEY,
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
} from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = makeRedirectUri({ scheme: 'com.shopomatic.app' });

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

  const discovery = useAutoDiscovery(`https://${AUTH0_DOMAIN}`);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: REDIRECT_URI,
    },
    discovery,
  );

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && discovery) {
      const { code } = response.params;
      exchangeCodeAsync(
        {
          clientId: AUTH0_CLIENT_ID,
          code,
          redirectUri: REDIRECT_URI,
          extraParams: { code_verifier: request?.codeVerifier ?? '' },
        },
        discovery,
      )
        .then((tokenResponse) => {
          const idToken = tokenResponse.idToken;
          if (idToken) {
            return handleAuth0Token(idToken);
          }
          setSignInError('No ID token returned from Auth0');
        })
        .catch((error: any) => {
          setSignInError(error.message ?? 'Token exchange failed. Please try again.');
        });
    } else if (response?.type === 'error') {
      setSignInError(response.error?.message ?? 'Sign-in failed. Please try again.');
    }
  }, [response, discovery]);

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

  const handleAuth0Token = async (idToken: string) => {
    try {
      const authResponse = await exchangeAuth0Token(idToken);

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
