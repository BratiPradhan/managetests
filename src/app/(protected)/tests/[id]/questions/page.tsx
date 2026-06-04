'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTestById } from '@/services/test.service'
import { bulkCreateQuestions } from '@/services/question.service'
import { fetchBulkQuestions } from '@/services/question.service'
import { updateTest } from '@/services/test.service'
import { useTopics } from '@/hooks/useTopics'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test, Question } from '@/types'
import { QuestionFormValues } from '@/lib/validations/question.schema'
import QuestionForm from '@/components/tests/QuestionForm'
import QuestionList from '@/components/tests/QuestionList'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { questions, addQuestion, updateQuestion, removeQuestion, setQuestions, setTestId } =
    useTestFlowStore()

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const { topics } = useTopics(test?.subject ?? null)
  const topicOptions = topics
    .filter((t) => test?.topics?.includes(t.id))
    .map((t) => ({ value: t.id, label: t.name }))

  useEffect(() => {
    setTestId(id)
    getTestById(id)
      .then(async (data) => {
        setTest(data)
        // Load existing questions if test already has them and store is empty
        if (data.questions?.length && questions.length === 0) {
          const existing = await fetchBulkQuestions(data.questions)
          setQuestions(existing)
        }
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddQuestion = (values: QuestionFormValues) => {
    const question: Question = { ...values, type: 'mcq', test_id: id }
    addQuestion(question)
    setEditingIndex(null)
  }

  const handleUpdateQuestion = (values: QuestionFormValues) => {
    if (editingIndex === null) return
    const question: Question = {
      ...questions[editingIndex],
      ...values,
      type: 'mcq',
      test_id: id,
    }
    updateQuestion(editingIndex, question)
    setEditingIndex(null)
  }

  const handleSaveAndContinue = async () => {
    if (questions.length === 0) {
      setError('Add at least one question before continuing.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const newQuestions = questions.filter((q) => !q.id)
      const existingIds = questions.filter((q) => q.id).map((q) => q.id!)

      let newIds: string[] = []
      if (newQuestions.length > 0) {
        const created = await bulkCreateQuestions(
          newQuestions.map(({ id: _id, ...rest }) => rest)
        )
        newIds = created.map((q) => q.id!)
      }

      const allIds = [...existingIds, ...newIds]
      await updateTest(id, {
        questions: allIds,
        total_questions: allIds.length,
      })

      router.push(`/tests/${id}/preview`)
    } catch {
      setError('Failed to save questions. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading...</div>
  }

  if (!test) {
    return <div className="text-center py-16 text-destructive">{error ?? 'Test not found.'}</div>
  }

  const editingQuestion = editingIndex !== null ? questions[editingIndex] : undefined
  const editingValues = editingQuestion
    ? {
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
    : undefined

  return (
    <div className="space-y-8">
      {/* Test details header */}
      <div className="bg-background border rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{test.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {test.total_time} mins · {test.total_marks} marks · {test.difficulty}
          </p>
        </div>
        <Badge variant={test.status === 'live' ? 'default' : 'secondary'}>
          {test.status ?? 'draft'}
        </Badge>
      </div>

      {/* Question form */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-base">
          {editingIndex !== null ? `Editing Question ${editingIndex + 1}` : 'Add a Question'}
        </h2>
        <QuestionForm
          key={editingIndex ?? 'new'}
          topics={topicOptions}
          defaultValues={editingValues}
          isEditing={editingIndex !== null}
          onSubmit={editingIndex !== null ? handleUpdateQuestion : handleAddQuestion}
          onCancel={() => setEditingIndex(null)}
        />
      </div>

      {/* Question list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">
            Questions Added{' '}
            <span className="text-muted-foreground font-normal">({questions.length})</span>
          </h2>
        </div>
        <QuestionList
          questions={questions}
          onEdit={(index) => {
            setEditingIndex(index)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onDelete={(index) => {
            removeQuestion(index)
            if (editingIndex === index) setEditingIndex(null)
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSaveAndContinue} disabled={saving || questions.length === 0}>
          {saving ? 'Saving...' : 'Save & Continue →'}
        </Button>
      </div>
    </div>
  )
}
