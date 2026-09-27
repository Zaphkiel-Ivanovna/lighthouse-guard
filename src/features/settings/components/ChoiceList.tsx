import { ListRow, ListSection } from '@/shared/ui';

export type Choice<T extends string> = {
  readonly value: T;
  readonly label: string;
  readonly subtitle?: string;
};

type Props<T extends string> = {
  readonly title?: string;
  readonly footer?: string;
  readonly choices: readonly Choice<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly testIDPrefix: string;
};

export function ChoiceList<T extends string>({ title, footer, choices, value, onChange, testIDPrefix }: Props<T>) {
  return (
    <ListSection title={title} footer={footer}>
      {choices.map((choice) => (
        <ListRow
          key={choice.value}
          testID={`${testIDPrefix}-${choice.value}`}
          title={choice.label}
          subtitle={choice.subtitle}
          accessory='check'
          selected={choice.value === value}
          onPress={() => onChange(choice.value)}
        />
      ))}
    </ListSection>
  );
}
