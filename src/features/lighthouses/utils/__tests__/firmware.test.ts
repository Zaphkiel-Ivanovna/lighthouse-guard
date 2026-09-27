import { formatFirmware } from '../firmware';

describe('formatFirmware', () => {
  it('lists the versions packed in a Base Station 2.0 firmware string', () => {
    expect(formatFirmware('R: 2.9.2004771 M: 1.8.2004742 B: 3.4.3782793')).toBe(
      'R 2.9.2004771 · M 1.8.2004742 · B 3.4.3782793',
    );
  });

  it('keeps any other firmware string as is', () => {
    expect(formatFirmware('1.2.3')).toBe('1.2.3');
    expect(formatFirmware('mock-1.0')).toBe('mock-1.0');
  });
});
