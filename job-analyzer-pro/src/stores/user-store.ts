import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/db'

interface UserState {
  currentUser: User | null
  apiKeys: Record<string, string>
  setCurrentUser: (user: User | null) => void
  setApiKey: (provider: string, key: string) => void
  removeApiKey: (provider: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      apiKeys: {},

      setCurrentUser: (user) => set({ currentUser: user }),

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      removeApiKey: (provider) =>
        set((state) => {
          const { [provider]: _, ...rest } = state.apiKeys
          return { apiKeys: rest }
        }),

      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
