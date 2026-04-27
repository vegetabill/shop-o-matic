export const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'}/api/v1`;

export const AUTH0_DOMAIN =
  process.env.EXPO_PUBLIC_AUTH0_DOMAIN ?? '';

export const AUTH0_CLIENT_ID =
  process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID ?? '';

export const SECURE_STORE_JWT_KEY = 'shop_o_matic_jwt';
export const SECURE_STORE_USER_KEY = 'shop_o_matic_user';

export const HOUSEHOLD_JOIN_BASE_URL =
  process.env.EXPO_PUBLIC_HOUSEHOLD_JOIN_BASE_URL ?? 'https://shop-o-matic.app/join';
