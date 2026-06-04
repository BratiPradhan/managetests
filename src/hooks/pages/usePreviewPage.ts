import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTestById, publishTest } from '@/services/test.service'
import { fetchBulkQuestions } from '@/services/question.service'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test, Question } from '@/types'

export function usePreviewPage(id: string) {
  const router = useRouter()
  const reset = useTestFlowStore((s) => s.reset)

  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const testData = await getTestById(id)
        setTest(testData)
        if (testData.questions?.length) {
          const qs = await fetchBulkQuestions(testData.questions)
          setQuestions(qs)
        }
      } catch {
        setError('Failed to load test.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handlePublish = useCallback(async () => {
    setPublishing(true)
    setError(null)
    try {
      await publishTest(id)
      setPublished(true)
      reset()
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Failed to publish. Please try again.')
      setPublishing(false)
    }
  }, [id, reset, router])

  const goToEdit = useCallback(() => router.push(`/tests/${id}/edit`), [id, router])
  const goToQuestions = useCallback(() => router.push(`/tests/${id}/questions`), [id, router])

  return {
    test,
    questions,
    loading,
    publishing,
    published,
    error,
    handlePublish,
    goToEdit,
    goToQuestions,
  }
}
