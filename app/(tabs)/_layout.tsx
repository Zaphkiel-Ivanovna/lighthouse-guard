import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import { Home, AudioWaveform } from '@tamagui/lucide-icons';
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
          tabBarIcon: ({ color }) => <Home color={color} />,
          headerRight: () => <ScanButton />,
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <AudioWaveform color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 24,
  },
});
