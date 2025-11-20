import { type FC } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'tamagui';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof Stack> {}

export const ScreenView: FC<Props> = ({ children, ...props }) => {
  const colorScheme = useColorScheme();

  return (
    <Stack
      flex={1}
      bg={'rgba(49, 49, 49, 0.6)'}
      borderColor={'rgba(255, 255, 255, 0.083)'}
      {...props}
    >
      {children}
    </Stack>
  );
};
