import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getTests } from '@/services/test.service'
import { Test } from '@/types'

export function useDashboard() {
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTests = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const data = await getTests()
      setTests(data)
    } catch {
      setError('Failed to load tests. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTests(false)
  }, [fetchTests])

  const goToCreate = () => router.push('/tests/create')

  return { tests, loading, error, fetchTests, goToCreate }
}
