import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
