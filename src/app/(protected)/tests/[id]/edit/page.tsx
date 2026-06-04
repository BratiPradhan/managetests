'use client'

import { useParams } from 'next/navigation'
import { useEditTest } from '@/hooks/pages/useEditTest'
import TestForm from '@/components/tests/TestForm'

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>()
  const { test, loading, error } = useEditTest(id)

  if (loading) {
    return <div className="text-center py-16 text-muted-foreground">Loading test...</div>
  }

  if (error || !test) {
    return <div className="text-center py-16 text-destructive">{error ?? 'Test not found.'}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Test</h1>
        <p className="text-sm text-muted-foreground mt-1">{test.name}</p>
      </div>
      <div className="bg-background rounded-lg border p-6">
        <TestForm initialData={test} testId={id} />
      </div>
    </div>
  )
}
