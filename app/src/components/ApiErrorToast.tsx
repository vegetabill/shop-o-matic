import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';

export interface ApiErrorToastHandle {
  show: (method: string, url: string, status: number | null, body: unknown) => void;
}

interface ToastMessage {
  headline: string;
  detail: string;
}

const ApiErrorToast = forwardRef<ApiErrorToastHandle>((_props, ref) => {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = () => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setMessage(null)
    );
  };

  const show = (method: string, url: string, status: number | null, body: unknown) => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);

    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const headline = `${method} ${path} → ${status ?? 'no response'}`;

    let detail = '';
    if (body && typeof body === 'object') {
      detail = JSON.stringify(body);
    } else if (body) {
      detail = String(body);
    }
    if (detail.length > 200) detail = detail.slice(0, 200) + '…';

    setMessage({ headline, detail });
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    dismissTimer.current = setTimeout(hide, 7000);
  };

  useImperativeHandle(ref, () => ({ show }));

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={hide} style={styles.inner}>
        <Text style={styles.headline} numberOfLines={2}>{message.headline}</Text>
        {message.detail ? (
          <Text style={styles.detail} numberOfLines={4}>{message.detail}</Text>
        ) : null}
        <Text style={styles.dismiss}>Tap to dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

ApiErrorToast.displayName = 'ApiErrorToast';
export default ApiErrorToast;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    left: 12,
    right: 12,
    backgroundColor: '#B91C1C',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
  },
  inner: {
    padding: 14,
  },
  headline: {
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    fontWeight: '600',
  },
  detail: {
    color: '#FCA5A5',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    marginTop: 6,
  },
  dismiss: {
    color: '#FCA5A5',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
});
