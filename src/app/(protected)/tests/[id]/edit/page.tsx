'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getTestById } from '@/services/test.service'
import { Test } from '@/types'
import TestForm from '@/components/tests/TestForm'

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTestById(id)
      .then(setTest)
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [id])

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
