'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTestById, publishTest } from '@/services/test.service'
import { fetchBulkQuestions } from '@/services/question.service'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test, Question } from '@/types'
import TestPreview from '@/components/tests/TestPreview'
import { Button } from '@/components/ui/button'

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
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

  const handlePublish = async () => {
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
  }

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading preview...</div>
  }

  if (!test) {
    return <div className="text-center py-16 text-destructive">{error ?? 'Test not found.'}</div>
  }

  if (published) {
    return (
      <div className="text-center py-24 space-y-3">
        <div className="text-4xl">🎉</div>
        <h2 className="text-xl font-semibold">Test Published!</h2>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Preview & Publish</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your test before publishing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/tests/${id}/edit`)}
            disabled={publishing}
          >
            Edit Test
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/tests/${id}/questions`)}
            disabled={publishing}
          >
            Edit Questions
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishing || test.status === 'live'}
          >
            {publishing
              ? 'Publishing...'
              : test.status === 'live'
              ? 'Already Published'
              : 'Publish Test'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <TestPreview test={test} questions={questions} />
    </div>
  )
}
