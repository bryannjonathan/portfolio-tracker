import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { theme } from '../asset/theme'
import { hp, wp } from '../helpers/common'
import { useRouter, usePathname } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
      icon: (isActive) => <Ionicons 
        name={isActive ? "home" : "home-outline"} 
        size={24} 
        color={isActive ? theme.colors.secondary : theme.colors.textLight} 
      />,
      path: '/home'
    },
    {
      name: 'Search',
      icon: (isActive) => <Ionicons 
        name={isActive ? "search" : "search-outline"} 
        size={24} 
        color={isActive ? theme.colors.secondary : theme.colors.textLight} 
      />,
      path: '/search'
    },
    {
      name: 'My Assets',
      icon: (isActive) => <Ionicons 
        name={isActive ? "wallet" : "wallet-outline"} 
        size={24} 
        color={isActive ? theme.colors.secondary : theme.colors.textLight} 
      />,
      path: '/assets'
    },
    {
      name: 'Profile',
      icon: (isActive) => <Ionicons 
        name={isActive ? "person" : "person-outline"} 
        size={24} 
        color={isActive ? theme.colors.secondary : theme.colors.textLight} 
      />,
      path: '/profile'
    }
  ]

  console.log(pathname);

  return (
    <View style={styles.container}>
      {navItems.map((item, index) => {
        const isActive = pathname === item.path;
        return (
          <TouchableOpacity 
            key={index}
            style={styles.navItem}
            onPress={() => router.replace(item.path)}
          >
            {item.icon(isActive)}
            {/* <Text style={[
              styles.navText,
              isActive && styles.activeNavText
            ]}>{item.name}</Text> */}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default BottomNav

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingVertical: hp(2),
    paddingHorizontal: wp(8),
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  activeNavText: {
    color: theme.colors.secondary,
    fontWeight: 'bold'
  }
})
