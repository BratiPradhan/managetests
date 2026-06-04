import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTestById, publishTest, updateTest } from '@/services/test.service'
import { bulkCreateQuestions, fetchBulkQuestions } from '@/services/question.service'
import { useTopics } from '@/hooks/useTopics'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test, Question } from '@/types'
import { QuestionFormValues } from '@/lib/validations/question.schema'

export function useQuestionsPage(id: string) {
  const router = useRouter()
  const { questions, setQuestions, setTestId, reset } = useTestFlowStore()

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  // Incremented to force QuestionEditor remount (e.g. after Delete All Edits)
  const [editorResetKey, setEditorResetKey] = useState(0)

  const { topics } = useTopics(test?.subject ?? null)
  const topicOptions = useMemo(
    () => topics.map((t) => ({ value: t.id, label: t.name })),
    [topics]
  )

  useEffect(() => {
    setTestId(id)
    const load = async () => {
      try {
        const data = await getTestById(id)
        setTest(data)
        if (data.questions?.length && questions.length === 0) {
          const existing = await fetchBulkQuestions(data.questions)
          setQuestions(existing)
        }
      } catch {
        setError('Failed to load test.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSaveQuestion = useCallback(
    (values: QuestionFormValues, index: number) => {
      const q: Question = { ...values, type: 'mcq', test_id: id }
      const updated = [...questions]
      if (index < updated.length) {
        updated[index] = { ...updated[index], ...q }
      } else {
        while (updated.length < index) {
          updated.push({ question: '', option1: '', option2: '', option3: '', option4: '', correct_option: '', type: 'mcq', test_id: id })
        }
        updated.push(q)
      }
      setQuestions(updated)
    },
    [questions, id, setQuestions]
  )

  const handleNavigate = useCallback((newIndex: number) => {
    setCurrentIndex(newIndex)
  }, [])

  const handleDeleteAll = useCallback(() => {
    const updated = [...questions]
    updated[currentIndex] = {
      question: '', option1: '', option2: '', option3: '', option4: '',
      correct_option: '', type: 'mcq', test_id: id,
    }
    setQuestions(updated)
    setEditorResetKey((k) => k + 1)
  }, [questions, currentIndex, id, setQuestions])

  const handleSaveAndContinue = useCallback(async () => {
    const filled = questions.filter((q) => q.question?.trim())
    if (filled.length === 0) {
      setError('Add at least one question before continuing.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const newQs = filled.filter((q) => !q.id)
      const existingIds = filled.filter((q) => q.id).map((q) => q.id!)
      let newIds: string[] = []
      if (newQs.length > 0) {
        const created = await bulkCreateQuestions(newQs.map(({ id: _id, ...rest }) => rest))
        newIds = created.map((q) => q.id!)
      }
      const allIds = [...existingIds, ...newIds]
      await updateTest(id, { questions: allIds, total_questions: allIds.length })
      router.push(`/tests/${id}/preview`)
    } catch {
      setError('Failed to save questions. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [questions, id, router])

  const handlePublish = useCallback(async () => {
    setPublishing(true)
    try {
      await publishTest(id)
      reset()
      router.push('/dashboard')
    } catch {
      setError('Failed to publish.')
    } finally {
      setPublishing(false)
    }
  }, [id, reset, router])

  const handleExit = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : undefined
  const editorDefaultValues = useMemo<Partial<QuestionFormValues> | undefined>(() => {
    if (!currentQuestion?.question) return undefined
    return {
      question: currentQuestion.question,
      option1: currentQuestion.option1,
      option2: currentQuestion.option2,
      option3: currentQuestion.option3,
      option4: currentQuestion.option4,
      correct_option: currentQuestion.correct_option as QuestionFormValues['correct_option'],
      explanation: currentQuestion.explanation ?? '',
      difficulty: currentQuestion.difficulty ?? '',
      topic: currentQuestion.topic ?? '',
      sub_topic: currentQuestion.sub_topic ?? '',
      media_url: currentQuestion.media_url ?? '',
    }
  }, [currentQuestion])

  return {
    test,
    loading,
    saving,
    publishing,
    error,
    questions,
    currentIndex,
    editorDefaultValues,
    editorResetKey,
    topicOptions,
    handleSaveQuestion,
    handleNavigate,
    handleDeleteAll,
    handleSaveAndContinue,
    handlePublish,
    handleExit,
  }
}
