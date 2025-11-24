import type { GetThemeValueForKey } from '@tamagui/core';
import type { FC, ReactNode } from 'react';
import { XStack, Text } from 'tamagui';

export interface ChipProps {
  /** The content to display inside the chip */
  children?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'filled' | 'outlined' | 'soft';
  /** Color scheme - uses Tamagui color tokens */
  color?: GetThemeValueForKey<'backgroundColor'>;
  /** Background color override */
  backgroundColor?: GetThemeValueForKey<'backgroundColor'>;
  /** Text color override */
  textColor?: GetThemeValueForKey<'color'>;
  /** Border color override */
  borderColor?: GetThemeValueForKey<'backgroundColor'>;
  /** Optional icon to display before the text */
  icon?: ReactNode;
  /** Optional icon to display after the text */
  endIcon?: ReactNode;
  opacity?: number;
}

const SIZE_CONFIG = {
  sm: {
    paddingHorizontal: '$2',
    paddingVertical: '$1.5',
    gap: '$1.5',
    fontSize: '$2',
    lineHeight: '$2',
  },
  md: {
    paddingHorizontal: '$3',
    paddingVertical: '$2',
    gap: '$2',
    fontSize: '$3',
    lineHeight: '$3',
  },
  lg: {
    paddingHorizontal: '$4',
    paddingVertical: '$2.5',
    gap: '$2.5',
    fontSize: '$4',
    lineHeight: '$4',
  },
} as const;

export const Chip: FC<ChipProps> = ({
  children,
  size = 'md',
  variant = 'filled',
  color,
  textColor,
  icon,
  endIcon,
  backgroundColor,
  borderColor,
  opacity,
  ...props
}) => {
  const sizeConfig = SIZE_CONFIG[size];

  // Build dynamic styles based on variant and color
  let bgColor = backgroundColor;
  let txtColor = textColor;
  let borderClr = borderColor;

  if (color && !backgroundColor) {
    if (variant === 'filled') {
      bgColor = color;
      txtColor = textColor || '$background';
    } else if (variant === 'outlined') {
      bgColor = 'transparent';
      borderClr = color;
      txtColor = textColor || color;
    } else if (variant === 'soft') {
      // Soft variant uses a lighter version of the color
      bgColor = `${color}3` as any;
      txtColor = textColor || color;
    }
  }

  // Default colors if not set
  if (!bgColor) {
    bgColor = variant === 'outlined' ? 'transparent' : '$background';
  }
  if (!txtColor) {
    txtColor = '$color';
  }
  if (!borderClr && variant === 'outlined') {
    borderClr = '$borderColor';
  }

  return (
    <XStack
      items='center'
      justify='center'
      rounded='$10'
      bg={bgColor}
      borderWidth={variant === 'outlined' ? 1 : 0}
      borderColor={borderClr}
      px={sizeConfig.paddingHorizontal}
      py={sizeConfig.paddingVertical}
      gap={sizeConfig.gap}
      opacity={opacity}
      {...props}
    >
      {icon}
      {children && (
        <Text
          fontWeight='600'
          color={txtColor}
          fontSize={sizeConfig.fontSize}
          lineHeight={sizeConfig.lineHeight}
        >
          {children}
        </Text>
      )}
      {endIcon}
    </XStack>
  );
};
