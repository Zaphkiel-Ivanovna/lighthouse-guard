import { useLighthouseStore } from '@/stores/lighthouse.store';
import { PenSquare, ScanSearch } from '@tamagui/lucide-icons';
import { FC, useMemo } from 'react';
import { ListItem, Separator, YGroup } from 'tamagui';
import { getSignalInfo } from '@/utils/signal';
import { useRenameDialogStore } from '@/stores/rename-dialog.store';

interface Props {
  readonly deviceId: string;
}

export const LighthouseDetailsView: FC<Props> = ({ deviceId }) => {
  const device = useLighthouseStore((state) => state.devices[deviceId]);
  const deviceCustomName = useLighthouseStore(
    (state) => state.customDeviceNames[deviceId]
  );
  const openRenameDialog = useRenameDialogStore((state) => state.openDialog);

  const deviceStrength = useMemo(() => {
    if (!device) {
      return null;
    }

    return getSignalInfo(device.rssi);
  }, [device?.rssi]);

  const handleRename = () => {
    console.log('handleRename');
    if (device) {
      openRenameDialog(device, 'displayName');
    }
  };

  if (!device) {
    return null;
  }

  return (
    <YGroup
      separator={<Separator borderColor='$black5' />}
      borderColor='$black5'
      borderWidth='$1'
    >
      <YGroup.Item>
        <ListItem
          title='Name'
          subTitle={deviceCustomName || device.name}
          iconAfter={
            <PenSquare onPress={handleRename} size={24} color='$black11' />
          }
        />
      </YGroup.Item>
      {deviceCustomName && (
        <YGroup.Item>
          <ListItem title='Original Name' subTitle={device.name} />
        </YGroup.Item>
      )}
      <YGroup.Item>
        <ListItem title='ID' subTitle={device.id} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem title='Signal' subTitle={deviceStrength?.label} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem title='Model Number' subTitle={device.modelNumber} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem title='Firmware' subTitle={device.firmwareRevision} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem title='Manufacturer' subTitle={device.manufacturerName} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem title='Serial Number' subTitle={device.serialNumber} />
      </YGroup.Item>
      <YGroup.Item>
        <ListItem
          title='Spot my Lighthouse'
          subTitle='Tap to make the LED blink'
          iconAfter={<ScanSearch size={24} color='$black11' />}
          onPress={() => {
            console.log('Spot my Lighthouse');
          }}
        />
      </YGroup.Item>
    </YGroup>
  );
};
