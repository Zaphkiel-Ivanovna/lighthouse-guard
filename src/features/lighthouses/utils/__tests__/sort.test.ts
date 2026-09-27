import type { Lighthouse } from '../../types';
import { sortLighthouses } from '../sort';

const lighthouse = (name: string, state: Lighthouse['state'], rssi: number): Lighthouse => ({
  id: name,
  name,
  state,
  rssi,
  channel: null,
});

const LIST = [lighthouse('Bravo', 'sleep', -70), lighthouse('Alpha', 'on', -80), lighthouse('Charlie', 'on', -50)];
const names = (list: Lighthouse[]) => list.map((item) => item.name);

describe('sortLighthouses', () => {
  it('sorts by display name', () => {
    expect(names(sortLighthouses(LIST, 'name', (item) => item.name))).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('uses custom names when sorting by name', () => {
    const nameOf = (item: Lighthouse) => (item.name === 'Charlie' ? 'Aardvark' : item.name);
    expect(names(sortLighthouses(LIST, 'name', nameOf))).toEqual(['Charlie', 'Alpha', 'Bravo']);
  });

  it('puts running stations first, then by name', () => {
    expect(names(sortLighthouses(LIST, 'state', (item) => item.name))).toEqual(['Alpha', 'Charlie', 'Bravo']);
  });

  it('puts the strongest signal first', () => {
    expect(names(sortLighthouses(LIST, 'signal', (item) => item.name))).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });
});
