import apiClient from '@/lib/axios'
import { ApiResponse, Question } from '@/types'

export const bulkCreateQuestions = async (questions: Omit<Question, 'id'>[]): Promise<Question[]> => {
  const { data } = await apiClient.post<ApiResponse<Question[]>>('/questions/bulk', { questions })
  return data.data
}

export const fetchBulkQuestions = async (questionIds: string[]): Promise<Question[]> => {
  const { data } = await apiClient.post<ApiResponse<Question[]>>('/questions/fetchBulk', {
    question_ids: questionIds,
  })
  return data.data
}
