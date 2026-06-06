import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTestById, updateTest } from '@/services/test.service'
import { bulkCreateQuestions, fetchBulkQuestions } from '@/services/question.service'
import { useTopics } from '@/hooks/useTopics'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test, Question } from '@/types'
import { QuestionFormValues } from '@/lib/validations/question.schema'

export function useQuestionsPage(id: string) {
  const router = useRouter()
  const { questions, addQuestion, updateQuestion, removeQuestion, setQuestions, setTestId } =
    useTestFlowStore()

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formKey, setFormKey] = useState(0)

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

  const resetForm = () => setFormKey((k) => k + 1)

  const handleAdd = useCallback(
    (values: QuestionFormValues) => {
      const q: Question = { ...values, type: 'mcq', test_id: id, subject: test?.subject }
      addQuestion(q)
      resetForm()
    },
    [addQuestion, id, test?.subject]
  )

  const handleUpdate = useCallback(
    (values: QuestionFormValues) => {
      if (editingIndex === null) return
      const existing = questions[editingIndex]
      updateQuestion(editingIndex, { ...existing, ...values, type: 'mcq', test_id: id, subject: test?.subject })
      setEditingIndex(null)
      resetForm()
    },
    [editingIndex, questions, updateQuestion, id, test?.subject]
  )

  const handleDelete = useCallback(
    (index: number) => {
      removeQuestion(index)
      if (editingIndex === index) {
        setEditingIndex(null)
        resetForm()
      }
    },
    [removeQuestion, editingIndex]
  )

  const handleEdit = useCallback((index: number) => {
    setEditingIndex(index)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null)
    resetForm()
  }, [])

  const handleSaveAndContinue = useCallback(async () => {
    if (questions.length === 0) {
      setError('Add at least one question before continuing.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const newQs = questions.filter((q) => !q.id)
      const existingIds = questions.filter((q) => q.id).map((q) => q.id!)
      let newIds: string[] = []
      if (newQs.length > 0) {
        const created = await bulkCreateQuestions(
          newQs.map(({ id: _id, ...rest }) => rest)
        )
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

  const handleExit = useCallback(() => router.push('/dashboard'), [router])

  const editingQuestion = editingIndex !== null ? questions[editingIndex] : null
  const formDefaultValues = useMemo<Partial<QuestionFormValues> | undefined>(() => {
    if (!editingQuestion) return undefined
    return {
      question: editingQuestion.question,
      option1: editingQuestion.option1,
      option2: editingQuestion.option2,
      option3: editingQuestion.option3,
      option4: editingQuestion.option4,
      correct_option: editingQuestion.correct_option as QuestionFormValues['correct_option'],
      explanation: editingQuestion.explanation ?? '',
      difficulty: editingQuestion.difficulty ?? '',
      topic: editingQuestion.topic ?? '',
      sub_topic: editingQuestion.sub_topic ?? '',
      media_url: editingQuestion.media_url ?? '',
    }
  }, [editingQuestion])

  return {
    test,
    loading,
    saving,
    error,
    questions,
    editingIndex,
    formKey,
    formDefaultValues,
    topicOptions,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleSaveAndContinue,
    handleExit,
  }
}
