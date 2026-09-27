import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStateStorage } from '@/core/storage';

import type { GroupMember, LighthouseGroup } from '../types';

type GroupsState = {
  readonly groups: readonly LighthouseGroup[];
  readonly startupGroupId: string | null;
  readonly activeGroupId: string | null;
};

type PersistedGroups = Pick<GroupsState, 'groups' | 'startupGroupId'>;

export const MAX_GROUP_NAME_LENGTH = 30;

export const initialGroupsState: GroupsState = { groups: [], startupGroupId: null, activeGroupId: null };

export const useGroupsStore = create<GroupsState>()(
  persist(() => initialGroupsState, {
    name: 'lighthouse-groups',
    version: 1,
    storage: createJSONStorage(() => mmkvStateStorage),
    partialize: ({ groups, startupGroupId }): PersistedGroups => ({ groups, startupGroupId }),
    merge: (persisted, current) => {
      const saved = (persisted ?? {}) as Partial<PersistedGroups>;
      const groups = saved.groups ?? current.groups;
      const startup = groups.find((group) => group.id === saved.startupGroupId)?.id ?? null;
      return { ...current, groups, startupGroupId: startup, activeGroupId: startup };
    },
  }),
);

const { setState } = useGroupsStore;

const normalizeName = (name: string) => name.trim().slice(0, MAX_GROUP_NAME_LENGTH);

export const isValidGroupName = (name: string) => normalizeName(name).length > 0;

export const uniqueMembers = (members: readonly GroupMember[]) =>
  members.filter((member, index) => members.findIndex((other) => other.id === member.id) === index);

const createGroupId = () => `group-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function createGroup(name: string, members: readonly GroupMember[]): string | null {
  if (!isValidGroupName(name)) return null;
  const id = createGroupId();
  setState((s) => ({ groups: [...s.groups, { id, name: normalizeName(name), members: uniqueMembers(members) }] }));
  return id;
}

export function updateGroup(id: string, name: string, members: readonly GroupMember[]): void {
  if (!isValidGroupName(name)) return;
  setState((s) => ({
    groups: s.groups.map((group) =>
      group.id === id ? { ...group, name: normalizeName(name), members: uniqueMembers(members) } : group,
    ),
  }));
}

export function deleteGroup(id: string): void {
  setState((s) => ({
    groups: s.groups.filter((group) => group.id !== id),
    activeGroupId: s.activeGroupId === id ? null : s.activeGroupId,
    startupGroupId: s.startupGroupId === id ? null : s.startupGroupId,
  }));
}

export function toggleGroupMember(groupId: string, member: GroupMember): void {
  setState((s) => ({
    groups: s.groups.map((group) => {
      if (group.id !== groupId) return group;
      const isMember = group.members.some((current) => current.id === member.id);
      return {
        ...group,
        members: isMember ? group.members.filter((current) => current.id !== member.id) : [...group.members, member],
      };
    }),
  }));
}

export function selectGroup(id: string | null): void {
  setState((s) => ({ activeGroupId: s.groups.some((group) => group.id === id) ? id : null }));
}

export function setStartupGroup(id: string | null): void {
  setState((s) => ({ startupGroupId: s.groups.some((group) => group.id === id) ? id : null }));
}
