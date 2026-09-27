import { storage } from '@/core/storage';

import {
  createGroup,
  deleteGroup,
  initialGroupsState,
  MAX_GROUP_NAME_LENGTH,
  selectGroup,
  setStartupGroup,
  toggleGroupMember,
  updateGroup,
  useGroupsStore,
} from '../groups.store';

const LEFT = { id: 'lh-left', name: 'LHB-1A2B3C4D' };
const RIGHT = { id: 'lh-right', name: 'LHB-5E6F7A8B' };

describe('groups store', () => {
  beforeEach(() => {
    storage.clearAll();
    useGroupsStore.setState(initialGroupsState, true);
  });

  it('creates a group with a trimmed name and unique members', () => {
    const id = createGroup('  Living room  ', [LEFT, RIGHT, LEFT]);

    expect(useGroupsStore.getState().groups).toEqual([{ id, name: 'Living room', members: [LEFT, RIGHT] }]);
  });

  it('refuses a blank name and caps long ones', () => {
    expect(createGroup('   ', [LEFT])).toBeNull();

    createGroup('x'.repeat(50), []);
    expect(useGroupsStore.getState().groups[0]?.name).toHaveLength(MAX_GROUP_NAME_LENGTH);
  });

  it('renames a group and replaces its members', () => {
    const id = createGroup('Office', [LEFT]) ?? '';

    updateGroup(id, 'Studio', [RIGHT]);

    expect(useGroupsStore.getState().groups).toEqual([{ id, name: 'Studio', members: [RIGHT] }]);
  });

  it('adds then removes a lighthouse from a group', () => {
    const id = createGroup('Office', []) ?? '';

    toggleGroupMember(id, LEFT);
    expect(useGroupsStore.getState().groups[0]?.members).toEqual([LEFT]);

    toggleGroupMember(id, LEFT);
    expect(useGroupsStore.getState().groups[0]?.members).toEqual([]);
  });

  it('falls back to all lighthouses when the shown or startup group is deleted', () => {
    const id = createGroup('Office', [LEFT]) ?? '';
    selectGroup(id);
    setStartupGroup(id);

    deleteGroup(id);

    expect(useGroupsStore.getState()).toMatchObject({ groups: [], activeGroupId: null, startupGroupId: null });
  });

  it('ignores unknown group ids', () => {
    selectGroup('missing');
    setStartupGroup('missing');

    expect(useGroupsStore.getState()).toMatchObject({ activeGroupId: null, startupGroupId: null });
  });

  it('persists groups and the startup choice, not the group currently shown', async () => {
    const office = createGroup('Office', [LEFT]) ?? '';
    const studio = createGroup('Studio', [RIGHT]) ?? '';
    setStartupGroup(office);
    selectGroup(studio);

    const saved = storage.getString('lighthouse-groups') ?? '';
    useGroupsStore.setState(initialGroupsState, true);
    storage.set('lighthouse-groups', saved);
    await useGroupsStore.persist.rehydrate();

    expect(useGroupsStore.getState()).toMatchObject({ startupGroupId: office, activeGroupId: office });
    expect(useGroupsStore.getState().groups.map((group) => group.name)).toEqual(['Office', 'Studio']);
  });
});
