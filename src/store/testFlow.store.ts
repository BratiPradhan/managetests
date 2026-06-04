import { create } from 'zustand'
import { Question, Test } from '@/types'

interface TestFlowState {
  testId: string | null
  testData: Partial<Test>
  questions: Question[]
  setTestId: (id: string) => void
  setTestData: (data: Partial<Test>) => void
  addQuestion: (question: Question) => void
  updateQuestion: (index: number, question: Question) => void
  removeQuestion: (index: number) => void
  setQuestions: (questions: Question[]) => void
  reset: () => void
}

export const useTestFlowStore = create<TestFlowState>()((set) => ({
  testId: null,
  testData: {},
  questions: [],

  setTestId: (id) => set({ testId: id }),
  setTestData: (data) => set({ testData: data }),
  addQuestion: (question) =>
    set((state) => ({ questions: [...state.questions, question] })),
  updateQuestion: (index, question) =>
    set((state) => {
      const updated = [...state.questions]
      updated[index] = question
      return { questions: updated }
    }),
  removeQuestion: (index) =>
    set((state) => ({
      questions: state.questions.filter((_, i) => i !== index),
    })),
  setQuestions: (questions) => set({ questions }),
  reset: () => set({ testId: null, testData: {}, questions: [] }),
}))
