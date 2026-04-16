export const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'}/api/v1`;

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export const SECURE_STORE_JWT_KEY = 'shop_o_matic_jwt';
export const SECURE_STORE_USER_KEY = 'shop_o_matic_user';

export const HOUSEHOLD_JOIN_BASE_URL =
  process.env.EXPO_PUBLIC_HOUSEHOLD_JOIN_BASE_URL ?? 'https://shop-o-matic.app/join';
