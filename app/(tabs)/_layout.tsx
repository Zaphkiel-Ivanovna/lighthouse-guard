import { Tabs } from 'expo-router';
import { GetThemeValueForKey, useTheme, getToken } from 'tamagui';
import { Home, AudioWaveform, Settings } from '@tamagui/lucide-icons';
import { Platform, useColorScheme } from 'react-native';
import LogoLight from '../../assets/logo-light.png';
import { Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { ScanButton } from '@/components/Lighthouse/ScanButton';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      detachInactiveScreens={Platform.OS !== 'ios'}
      screenOptions={{
        tabBarActiveTintColor: theme.accent1.val,
        tabBarInactiveTintColor: theme.white10.val,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: theme.borderColor.val,
          shadowColor: 'transparent',
        },
        headerStyle: {
          backgroundColor: 'transparent',
          shadowColor: 'transparent',
        },
        headerRightContainerStyle: {
          paddingRight: 16,
        },
        headerLeftContainerStyle: {
          paddingLeft: 6,
        },
        headerTitleAlign: 'left',
        animation: 'shift',
        sceneStyle: {
          backgroundColor: 'transparent',
        },
        headerTitle: () => (
          <Image source={LogoLight} style={styles.logo} resizeMode='contain' />
        ),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? theme.accent1 : theme.white10} />
          ),
          headerRight: () => <ScanButton />,
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <Settings color={focused ? theme.accent1 : theme.white10} />
          ),
        }}
      />
      <Tabs.Screen name='[id]' options={{ headerTitle: '', href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 24,
  },
});
