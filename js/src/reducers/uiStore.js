import { create } from 'zustand';

export const useUIStore = create((set) => ({
  activeView: 'dashboard',
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  notifications: [],
  theme: 'light',
  loading: false,
  
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), timestamp: new Date().toISOString(), ...notification }]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setLoading: (loading) => set({ loading })
}));