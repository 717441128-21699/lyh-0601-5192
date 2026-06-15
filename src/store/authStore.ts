import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password, role) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUsers: Record<string, User> = {
          ministry: {
            id: 'user_ministry',
            username: 'ministry',
            name: '教育部管理员',
            role: 'ministry',
            permissions: ['dashboard:view', 'data:view:*', 'warning:*', 'report:*', 'curriculum:*', 'ingestion:*'],
          },
          provincial: {
            id: 'user_provincial_11',
            username: 'provincial_bj',
            name: '北京市教育厅管理员',
            role: 'provincial',
            provinceId: '11',
            permissions: [
              'dashboard:view',
              'data:view',
              'warning:view',
              'warning:review:11',
              'warning:review',
              'report:view',
              'report:generate',
              'curriculum:view',
            ],
          },
          university: {
            id: 'user_university_u_11_0',
            username: 'university_bj_0',
            name: '北京大学管理员',
            role: 'university',
            provinceId: '11',
            universityId: 'u_11_0',
            permissions: [
              'dashboard:view',
              'data:view',
              'warning:view',
              'warning:confirm:u_11_0',
              'warning:confirm',
              'report:view',
              'curriculum:view',
              'curriculum:upload',
            ],
          },
        };

        const key = role;
        if (mockUsers[key] && password === '123456') {
          set({
            user: mockUsers[key],
            token: 'mock_token_' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
