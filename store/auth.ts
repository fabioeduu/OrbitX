import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { setAuthToken } from '../services/api';
import { authApi } from '../services/orbitApi';
import type { UserRole } from '../types/api';
export type AuthSession = {
  token:       string;
  uid:         string;
  email:       string;
  name:        string;
  companyName: string;
  role:        UserRole;
};
type AuthState = {
  session:               AuthSession | null;
  hasCompletedOnboarding: boolean;
  isLoadingAuth:         boolean;
  hydrateComplete:       boolean;
  completeOnboarding: () => void;
  setHydrateComplete: (v: boolean) => void;
  login: (p: { email: string; password: string }) => Promise<void>;
  register: (p: {
    companyName: string;
    taxId:       string;
    adminName:   string;
    email:       string;
    password:    string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session:               null,
      hasCompletedOnboarding: false,
      isLoadingAuth:         false,
      hydrateComplete:       false,
      setHydrateComplete: (v) => set({ hydrateComplete: v }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      login: async ({ email, password }) => {
        set({ isLoadingAuth: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { accessToken, user } = data.data;
          setAuthToken(accessToken);
          set({
            session: {
              token:       accessToken,
              uid:         String(user.id),
              email:       user.email,
              name:        user.name,
              companyName: user.companyName,
              role:        user.role,
            },
          });
        } finally {
          set({ isLoadingAuth: false });
        }
      },


     register: async ({ companyName, taxId, adminName, email, password }) => {
        set({ isLoadingAuth: true });
        try {
          const { data } = await authApi.register({
            companyName,
            taxId,
            adminName,
            email,
            password,
          });
          const { accessToken, user } = data.data;
          setAuthToken(accessToken);
          set({
            session: {
              token:       accessToken,
              uid:         String(user.id),
              email:       user.email,
              name:        user.name,
              companyName: user.companyName,
              role:        user.role,
            },
          });
          
        } catch (error: any) {
          console.log('Status:', error?.response?.status);
          console.log('Data:', JSON.stringify(error?.response?.data));
          throw error;
        } finally {
          set({ isLoadingAuth: false });
        }
      },
      logout: async () => {
        setAuthToken(null);
        set({ session: null });
      },
    }),
    {
      name: 'orbitx-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        session:               s.session,
        hasCompletedOnboarding: s.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (state?.session?.token) {
          setAuthToken(state.session.token);
        }
        useAuthStore.setState({ hydrateComplete: true });
        if (error) console.warn('[OrbitX] Hydration error:', error);
      },
    },
  ),
);
export function useIsLoggedIn() {
  return useAuthStore((s) => Boolean(s.session));
}
