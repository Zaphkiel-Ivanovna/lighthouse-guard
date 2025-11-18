import { Tabs } from 'expo-router';
import { Button, useTheme } from 'tamagui';
import { Atom, AudioWaveform } from '@tamagui/lucide-icons';
import { Platform, useColorScheme } from 'react-native';
import LogoDark from '../../assets/logo-dark.png';
import LogoLight from '../../assets/logo-light.png';
import { Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { Appearance } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      detachInactiveScreens={Platform.OS !== 'ios'}
      screenOptions={{
        tabBarActiveTintColor: theme.red10.val,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.borderColor.val,
        },
        headerStyle: {
          backgroundColor: theme.background.val,
          borderBottomColor: theme.borderColor.val,
        },
        headerTintColor: theme.color.val,

        animation: 'shift',
        headerTitle: () => (
          <Image
            source={colorScheme === 'dark' ? LogoLight : LogoDark}
            style={styles.logo}
            resizeMode='contain'
          />
        ),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Tab One',
          tabBarIcon: ({ color }) => <Atom color={color as any} />,
          headerRight: () => (
            <Button
              mr='$4'
              size='$2.5'
              onPressIn={() =>
                Appearance.setColorScheme(
                  colorScheme === 'dark' ? 'light' : 'dark'
                )
              }
            >
              Hello!
            </Button>
          ),
        }}
      />
      <Tabs.Screen
        name='two'
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <AudioWaveform color={color as any} />,
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
