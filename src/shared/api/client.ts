import { env } from '@/shared/config'

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    throw new Error(`[${res.status}] ${res.statusText}`)
  }

  return res.json() as Promise<T>
}
