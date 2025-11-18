import { LighthouseDevice } from 'types/lighthouse.types';
import { create } from 'zustand';

interface RenameDialogState {
  isOpen: boolean;
  device: LighthouseDevice | null;
  name: string;
  nameError: string;

  openDialog: (device: LighthouseDevice, name: string) => void;
  closeDialog: () => void;
  setName: (name: string) => void;
  setNameError: (error: string) => void;
  validateAndSubmit: () => boolean;
  reset: () => void;
}

export const useRenameDialogStore = create<RenameDialogState>((set, get) => ({
  isOpen: false,
  device: null,
  name: '',
  nameError: '',

  openDialog: (device: LighthouseDevice, name: string) => {
    set({
      isOpen: true,
      device,
      name,
      nameError: '',
    });
  },

  closeDialog: () => {
    set({ isOpen: false });
    // Reset after a short delay to allow closing animation
    setTimeout(() => {
      get().reset();
    }, 300);
  },

  setName: (name: string) => {
    set({ name, nameError: '' });
  },

  setNameError: (error: string) => {
    set({ nameError: error });
  },

  validateAndSubmit: () => {
    const { name } = get();
    let hasError = false;

    if (!name.trim()) {
      set({ nameError: 'Name is required' });
      hasError = true;
    } else if (name.trim().length < 2) {
      set({ nameError: 'Name must be at least 2 characters' });
      hasError = true;
    } else {
      set({ nameError: '' });
    }

    return !hasError;
  },

  reset: () => {
    set({
      device: null,
      name: '',
      nameError: '',
    });
  },
}));
