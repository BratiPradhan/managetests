'use client'

import { useParams } from 'next/navigation'
import { usePreviewPage } from '@/hooks/pages/usePreviewPage'
import TestPreview from '@/components/tests/TestPreview'
import { Button } from '@/components/ui/button'

export default function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const {
    test,
    questions,
    loading,
    publishing,
    published,
    error,
    handlePublish,
    goToEdit,
    goToQuestions,
  } = usePreviewPage(id)

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Preview & Publish</h1>
          <p className="text-sm text-muted-foreground mt-1">Review your test before publishing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToEdit} disabled={publishing}>
            Edit Test
          </Button>
          <Button variant="outline" onClick={goToQuestions} disabled={publishing}>
            Edit Questions
          </Button>
          <Button onClick={handlePublish} disabled={publishing || test.status === 'live'}>
            {publishing ? 'Publishing...' : test.status === 'live' ? 'Already Published' : 'Publish Test'}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <TestPreview test={test} questions={questions} />
    </div>
  )
}
