import { FC, ReactNode } from 'react';
import { Circle, Stack, StackProps, useTheme } from 'tamagui';
import { cloneElement, isValidElement } from 'react';

interface CircularButtonProps extends Omit<StackProps, 'children'> {
  children?: ReactNode;
  circleSize?: number;
}

export const CircularButton: FC<CircularButtonProps> = ({
  children,
  circleSize = 64,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Circle
      width={circleSize}
      height={circleSize}
      borderBottomLeftRadius={circleSize / 2}
      borderBottomRightRadius={circleSize / 2}
      borderTopLeftRadius={circleSize / 2}
      borderTopRightRadius={circleSize / 2}
      justify='center'
      items='center'
      cursor='pointer'
      {...props}
    >
      {isValidElement(children)
        ? cloneElement(children, {
            color: theme.color?.get?.() || '$color',
          } as any)
        : children}
    </Circle>
  );
};

export type { CircularButtonProps };
