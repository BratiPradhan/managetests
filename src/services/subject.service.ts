import apiClient from '@/lib/axios'
import { ApiResponse, Subject, SubTopic, Topic } from '@/types'

export const getSubjects = async (): Promise<Subject[]> => {
  const { data } = await apiClient.get<ApiResponse<Subject[]>>('/subjects')
  return data.data
}

export const getTopicsBySubject = async (subjectId: string): Promise<Topic[]> => {
  const { data } = await apiClient.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`)
  return data.data
}

export const getSubTopicsByTopic = async (topicId: string): Promise<SubTopic[]> => {
  const { data } = await apiClient.get<ApiResponse<SubTopic[]>>(`/sub-topics/topic/${topicId}`)
  return data.data
}

export const getSubTopicsByTopicIds = async (topicIds: string[]): Promise<SubTopic[]> => {
  const { data } = await apiClient.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', {
    topicIds,
  })
  return data.data
}
