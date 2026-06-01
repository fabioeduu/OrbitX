// store/auth.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthSession = {
  uid: string;
  email: string;
  companyName: string;
};

type AuthState = {
  session: AuthSession | null;
  hasCompletedOnboarding: boolean;
  isLoadingAuth: boolean;
  hydrateComplete: boolean;

  completeOnboarding: () => void;
  login: (p: { email: string; password: string }) => Promise<void>;
  register: (p: {
    companyName: string;
    email: string;
    password: string;
  }) => Promise<void>;

  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  setHydrateComplete: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      hasCompletedOnboarding: false,
      isLoadingAuth: false,
      hydrateComplete: false,

      setHydrateComplete: (v) => set({ hydrateComplete: v }),

      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true }),

      login: async ({ email }) => {
        set({ isLoadingAuth: true });

        try {
          // MOCK LOGIN
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );

          set({
            session: {
              uid: '1',
              email,
              companyName: 'OrbitX',
            },
          });
        } finally {
          set({ isLoadingAuth: false });
        }
      },

      register: async ({ companyName, email }) => {
        set({ isLoadingAuth: true });

        try {
          // MOCK REGISTER
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );

          set({
            session: {
              uid: '1',
              email,
              companyName,
            },
          });
        } finally {
          set({ isLoadingAuth: false });
        }
      },

      logout: async () => {
        set({ session: null });
      },

      updatePassword: async () => {
        console.log('Senha atualizada');
      },

      updateEmail: async (newEmail) => {
        const session = get().session;

        if (!session) return;

        set({
          session: {
            ...session,
            email: newEmail,
          },
        });
      },
    }),
    {
      name: 'orbitx-auth',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (s) => ({
        session: s.session,
        hasCompletedOnboarding:
          s.hasCompletedOnboarding,
      }),

      onRehydrateStorage: () => (state, error) => {
        useAuthStore.setState({
          hydrateComplete: true,
        });

        if (error)
          console.warn(
            '[OrbitX] Hydration error:',
            error
          );
      },
    }
  )
);

export function useIsLoggedIn() {
  return useAuthStore((s) => Boolean(s.session));
}