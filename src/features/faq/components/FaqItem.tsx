import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { Icon, IconBadge, Text, type IconName } from '@/shared/ui';
import { haptics } from '@/shared/utils/haptics';
import { spring, transitions } from '@/theme';

const CHEVRON = { ios: 'chevron.down', android: 'expand_more' } as const;

type Props = {
  readonly icon: IconName;
  readonly question: string;
  readonly answer: string;
  readonly testID?: string;
};

export function FaqItem({ icon, question, answer, testID }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.set(withSpring(isOpen ? 180 : 0, spring.smooth));
  }, [isOpen, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.get()}deg` }] }));

  const toggle = () => {
    haptics.selection();
    setIsOpen((open) => !open);
  };

  return (
    <Animated.View style={styles.item} layout={transitions.layout()}>
      <Pressable
        testID={testID}
        onPress={toggle}
        style={styles.header}
        accessibilityRole='button'
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={question}
      >
        <IconBadge icon={icon} tint='accent' size={32} />
        <Text variant='headline' style={styles.question}>
          {question}
        </Text>
        <Animated.View style={chevronStyle}>
          <Icon name={CHEVRON} size={16} tone='muted' />
        </Animated.View>
      </Pressable>
      {isOpen && (
        <Animated.View entering={transitions.crossfadeIn()}>
          <View style={styles.answer}>
            <Text tone='muted'>{answer}</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space(3),
    padding: theme.space(4),
    minHeight: 56,
  },
  question: {
    flex: 1,
  },
  answer: {
    paddingHorizontal: theme.space(4),
    paddingBottom: theme.space(4),
  },
}));
