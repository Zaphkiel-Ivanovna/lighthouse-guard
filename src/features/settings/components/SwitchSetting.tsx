import { ListRow, Switch, type IconName } from '@/shared/ui';

type Props = {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon?: IconName;
  readonly value: boolean;
  readonly onChange: (value: boolean) => void;
  readonly testID: string;
};

export function SwitchSetting({ title, subtitle, icon, value, onChange, testID }: Props) {
  return (
    <ListRow
      icon={icon}
      title={title}
      subtitle={subtitle}
      accessory={<Switch testID={testID} value={value} onValueChange={onChange} accessibilityLabel={title} />}
    />
  );
}
