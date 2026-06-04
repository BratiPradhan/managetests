import { useEffect, useState } from 'react'
import { getTestById } from '@/services/test.service'
import { Test } from '@/types'

export function useEditTest(id: string) {
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTestById(id)
      .then(setTest)
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [id])

  return { test, loading, error }
}
