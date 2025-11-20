import { YStack } from 'tamagui';
import { useLighthouseStore } from '@/stores/lighthouse.store';
import { FlatList } from 'react-native';
import { LighthouseDevice } from '@/types/lighthouse.types';
import { useMemo } from 'react';
import { LighthouseCard } from '@/components/Lighthouse/Card';
import { LighthouseEmptyState } from '@/components/Lighthouse/EmptyState';

export default function TabOneScreen() {
  const devices = useLighthouseStore((state) => state.devices);
  const deviceArray = useMemo(() => Object.values(devices), [devices]);

  return (
    <YStack flex={1} px='$4' py='$4'>
      <FlatList<LighthouseDevice>
        data={deviceArray}
        renderItem={({ item, index }) => (
          <LighthouseCard lighthouse={item} index={index} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          gap: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={<LighthouseEmptyState />}
        showsVerticalScrollIndicator={true}
        style={{ width: '100%' }}
      />
    </YStack>
  );
}
