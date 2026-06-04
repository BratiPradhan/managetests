'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTestById, publishTest, updateTest } from '@/services/test.service'
import { bulkCreateQuestions, fetchBulkQuestions } from '@/services/question.service'
import { useTopics } from '@/hooks/useTopics'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test, Question } from '@/types'
import { QuestionFormValues } from '@/lib/validations/question.schema'
import QuestionSidebar from '@/components/tests/QuestionSidebar'
import QuestionEditor from '@/components/tests/QuestionEditor'
import { Badge } from '@/components/ui/badge'

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { questions, setQuestions, setTestId, reset } = useTestFlowStore()

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const { topics } = useTopics(test?.subject ?? null)
  const topicOptions = topics.map((t) => ({ value: t.id, label: t.name }))

  useEffect(() => {
    setTestId(id)
    getTestById(id)
      .then(async (data) => {
        setTest(data)
        if (data.questions?.length && questions.length === 0) {
          const existing = await fetchBulkQuestions(data.questions)
          setQuestions(existing)
        }
      })
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSaveQuestion = (values: QuestionFormValues, index: number) => {
    const q: Question = { ...values, type: 'mcq', test_id: id }
    const updated = [...questions]
    if (index < updated.length) {
      updated[index] = { ...updated[index], ...q }
    } else {
      // Fill any gaps with empty questions
      while (updated.length < index) {
        updated.push({ question: '', option1: '', option2: '', option3: '', option4: '', correct_option: '', type: 'mcq', test_id: id })
      }
      updated.push(q)
    }
    setQuestions(updated)
  }

  const handleNavigate = (newIndex: number) => {
    setCurrentIndex(newIndex)
  }

  const handleDeleteAll = () => {
    const updated = [...questions]
    updated[currentIndex] = { question: '', option1: '', option2: '', option3: '', option4: '', correct_option: '', type: 'mcq', test_id: id }
    setQuestions(updated)
    // Force editor remount
    setCurrentIndex((i) => { setTimeout(() => setCurrentIndex(i), 0); return -1 })
  }

  const handleSaveAndContinue = async () => {
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
  }

  const handlePublish = async () => {
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
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
  }

  if (!test) {
    return <div className="flex items-center justify-center h-full text-red-500">{error ?? 'Test not found.'}</div>
  }

  const totalSlots = test.total_questions || 10
  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : undefined
  const editorDefaultValues = currentQuestion?.question
    ? {
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
    : undefined

  return (
    <div className="-m-6 flex overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* Question navigation sidebar */}
      <QuestionSidebar
        questions={questions}
        totalQuestions={totalSlots}
        currentIndex={currentIndex}
        onSelect={(i) => {
          setCurrentIndex(i)
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <span>Test Creation</span>
            <span>/</span>
            <span>Create Test</span>
            <span>/</span>
            <span className="text-gray-700 font-medium capitalize">{test.type?.replace('_', ' ')}</span>
          </nav>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Test info card */}
          <div className="mx-6 mt-5 border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
              <span className="inline-block bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full capitalize">
                {test.type?.replace('_', ' ') || 'Chapter Wise'}
              </span>
              <button className="text-blue-400 hover:text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-semibold text-gray-800">{test.name}</span>
              <Badge variant="secondary" className="capitalize text-green-700 bg-green-50 border-green-200 text-xs">
                {test.difficulty}
              </Badge>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-sm mb-4">
              <span className="text-gray-400">Subject</span>
              <span className="text-gray-700">: {typeof test.subject === 'string' ? test.subject.slice(0, 8) + '…' : '—'}</span>
              <span className="text-gray-400">Topic</span>
              <div className="flex flex-wrap gap-1">
                {test.topics?.map((t) => (
                  <span key={t} className="bg-orange-50 text-orange-600 border border-orange-200 text-xs px-2 py-0.5 rounded-full">
                    {topicOptions.find(o => o.value === t)?.label ?? t.slice(0, 8)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span>⏱ {test.total_time} Min</span>
              <span>📝 {test.total_questions} Q&apos;s</span>
              <span>📊 {test.total_marks} Marks</span>
            </div>
          </div>

          {/* Question editor */}
          <div className="mx-6 my-5">
            {currentIndex >= 0 && (
              <QuestionEditor
                key={currentIndex}
                index={currentIndex}
                total={totalSlots}
                defaultValues={editorDefaultValues}
                topics={topicOptions}
                onSave={handleSaveQuestion}
                onNavigate={handleNavigate}
                onDeleteAll={handleDeleteAll}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-white shrink-0">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 rounded-lg bg-red-400 hover:bg-red-500 text-sm font-semibold text-white transition-colors"
          >
            Exit Test Creation
          </button>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={saving}
            className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
          >
            {saving ? 'Saving...' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
