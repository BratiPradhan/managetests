import apiClient from '@/lib/axios'
import { ApiResponse, CreateTestPayload, Test, UpdateTestPayload } from '@/types'

export const getTests = async (): Promise<Test[]> => {
  const { data } = await apiClient.get<ApiResponse<Test[]>>('/tests')
  return data.data
}

export const getTestById = async (id: string): Promise<Test> => {
  const { data } = await apiClient.get<ApiResponse<Test>>(`/tests/${id}`)
  return data.data
}

export const createTest = async (payload: CreateTestPayload): Promise<Test> => {
  const { data } = await apiClient.post<ApiResponse<Test>>('/tests', payload)
  return data.data
}

export const updateTest = async (id: string, payload: UpdateTestPayload): Promise<Test> => {
  const { data } = await apiClient.put<ApiResponse<Test>>(`/tests/${id}`, payload)
  return data.data
}

export const deleteTest = async (id: string): Promise<void> => {
  await apiClient.delete(`/tests/${id}`)
}

export const publishTest = async (id: string): Promise<Test> => {
  const { data } = await apiClient.put<ApiResponse<Test>>(`/tests/${id}`, { status: 'live' })
  return data.data
}
