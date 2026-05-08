import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';
type Direction = 'ltr' | 'rtl';

interface ThemeConfigState {
  isSidebarExpanded: boolean;
  themeMode: ThemeMode;
  direction: Direction;
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: ThemeMode) => void;
  setDirection: (dir: Direction) => void;
}

export const useThemeConfigStore = create<ThemeConfigState>()(
  persist(
    (set) => ({
      isSidebarExpanded: true,
      themeMode: 'light',
      direction: 'ltr',

      toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      setTheme: (themeMode) => set({ themeMode }),
      setDirection: (direction) => set({ direction }),
    }),
    {
      name: 'theme-config-storage',
    }
  )
);
