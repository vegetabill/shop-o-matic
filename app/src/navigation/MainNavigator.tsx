import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ListScreen from '../screens/ListScreen';
import ShoppingScreen from '../screens/ShoppingScreen';
import StoresScreen from '../screens/StoresScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import HouseholdListScreen from '../screens/HouseholdListScreen';

export type ListStackParamList = {
  List: undefined;
  Shopping: undefined;
  HouseholdList: undefined;
};

export type MainTabParamList = {
  ListStack: undefined;
  Stores: undefined;
  Categories: undefined;
};

const ListStack = createNativeStackNavigator<ListStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function ListStackNavigator() {
  return (
    <ListStack.Navigator>
      <ListStack.Screen
        name="List"
        component={ListScreen}
        options={{ headerShown: false }}
      />
      <ListStack.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{
          title: 'Shopping',
          presentation: 'modal',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
      <ListStack.Screen
        name="HouseholdList"
        component={HouseholdListScreen}
        options={{
          title: 'Households',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </ListStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="ListStack"
        component={ListStackNavigator}
        options={{
          title: 'List',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>📝</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Stores"
        component={StoresScreen}
        options={{
          title: 'Stores',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>🏪</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 2, color }}>📂</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
