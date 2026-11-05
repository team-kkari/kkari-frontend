import { create } from 'zustand'

/** 백엔드 TokenResponse.role */
export type UserRole = 'MSP_ENGINEER' | 'CUSTOMER'

export interface Session {
  accessToken: string
  role: UserRole
}

const STORAGE_KEY = 'kkari.session'

function load(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

interface SessionState {
  session: Session | null
  setSession: (session: Session) => void
  clearSession: () => void
}

/** 로그인 세션. 새로고침 후에도 유지되도록 localStorage 에 저장한다 */
export const useSessionStore = create<SessionState>((set) => ({
  session: load(),
  setSession: (session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    set({ session })
  },
  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ session: null })
  },
}))

/** 역할별 첫 화면. 엔지니어는 의뢰 상담, 고객은 고객 창구 */
export const homePathOf = (role: UserRole) => (role === 'CUSTOMER' ? '/desk' : '/')

export const getAccessToken = () => useSessionStore.getState().session?.accessToken ?? null
