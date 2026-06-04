import apiClient from '@/lib/axios'
import { ApiResponse, LoginPayload, User } from '@/types'

export const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<ApiResponse<{ token: string; user: User }>>(
    '/auth/login',
    payload
  )
  return data.data
}
