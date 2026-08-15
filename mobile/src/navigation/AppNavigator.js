import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator }     from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, View } from 'react-native'

import { useAuth } from '../context/AuthContext'

import LoginScreen       from '../screens/LoginScreen'
import RegisterScreen    from '../screens/RegisterScreen'
import DashboardScreen   from '../screens/DashboardScreen'
import TransactionsScreen from '../screens/TransactionsScreen'
import AddTransactionScreen from '../screens/AddTransactionScreen'
import BudgetScreen      from '../screens/BudgetScreen'
import ReportsScreen     from '../screens/ReportsScreen'
import ProfileScreen     from '../screens/ProfileScreen'

const Stack = createStackNavigator()
const Tab   = createBottomTabNavigator()

const THEME = {
  colors: {
    primary: '#6C63FF',
    background: '#0D0D1A',
    card: '#12122A',
    text: '#F0F0FF',
    border: 'rgba(255,255,255,0.06)',
    notification: '#FF6584',
  },
  dark: true,
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#12122A',
          borderTopColor: 'rgba(255,255,255,0.06)',
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#5A5A7A',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard:    focused ? 'home'        : 'home-outline',
            Transactions: focused ? 'list'        : 'list-outline',
            Budget:       focused ? 'wallet'      : 'wallet-outline',
            Reports:      focused ? 'bar-chart'   : 'bar-chart-outline',
            Profile:      focused ? 'person'      : 'person-outline',
          }
          return <Ionicons name={icons[route.name]} size={22} color={color} />
        },
      })}
    >
      <Tab.Screen name="Dashboard"    component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budget"       component={BudgetScreen} />
      <Tab.Screen name="Reports"      component={ReportsScreen} />
      <Tab.Screen name="Profile"      component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0D0D1A' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    )
  }

  return (
    <NavigationContainer theme={THEME}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen}
              options={{ presentation: 'modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
