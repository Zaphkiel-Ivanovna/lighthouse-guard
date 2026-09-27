import { ListRow, Switch } from '@/shared/ui';

type Props = {
  readonly title: string;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly testID: string;
};

export function SwitchSetting({ title, value, onChange, testID }: Props) {
  return (
    <ListRow
      title={title}
      accessory={<Switch testID={testID} value={value} onValueChange={onChange} accessibilityLabel={title} />}
    />
  );
}
