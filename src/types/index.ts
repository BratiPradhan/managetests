import { TestType, Difficulty, CorrectOption, QuestionType } from '@/lib/constants'

export interface User {
  id: string
  name?: string
  email?: string
}

export interface Subject {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
}

export interface SubTopic {
  id: string
  name: string
  topic_id: string
}

export type TestStatus = 'live' | 'unpublished' | 'scheduled' | 'expired' | 'draft'

export interface Test {
  id: string
  name: string
  type: TestType
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
  created_at?: string
  questions?: string[]
}

export interface Question {
  id?: string
  type: QuestionType
  subject?: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: CorrectOption
  explanation?: string
  difficulty?: string
  topic?: string
  sub_topic?: string
  media_url?: string
  test_id: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface LoginPayload {
  userId: string
  password: string
}

export interface CreateTestPayload {
  name: string
  type: TestType
  subject: string
  topics: string[]
  sub_topics?: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
}

export interface UpdateTestPayload extends Partial<CreateTestPayload> {
  questions?: string[]
}
