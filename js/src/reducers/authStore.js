import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      token: null,
      loading: false,
      error: null,
      
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const mockUsers = {
            'user@ktf.com': { 
              id: '4961', 
              name: 'Operator 4961', 
              role: 'user',
              department: 'Production',
              line: '4DU'
            },
            'hr@ktf.com': { 
              id: 'hr001', 
              name: 'HR Manager', 
              role: 'hr',
              department: 'Human Resources'
            },
            'admin@ktf.com': { 
              id: 'admin001', 
              name: 'System Admin', 
              role: 'admin',
              department: 'IT'
            }
          };
          
          const user = mockUsers[credentials.email];
          
          if (user && credentials.password === 'password') {
            set({
              user,
              isAuthenticated: true,
              role: user.role,
              token: 'mock-jwt-token',
              loading: false
            });
            return { success: true };
          } else {
            set({ error: 'Invalid credentials', loading: false });
            return { success: false, error: 'Invalid credentials' };
          }
        } catch (error) {
          set({ error: error.message, loading: false });
          return { success: false, error: error.message };
        }
      },
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        role: null,
        token: null,
        error: null
      }),
      
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
      
      clearError: () => set({ error: null }),
      
      hasPermission: (requiredRole) => {
        const { role } = get();
        const roleHierarchy = { admin: 3, hr: 2, user: 1 };
        return roleHierarchy[role] >= roleHierarchy[requiredRole];
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        token: state.token
      })
    }
  )
);