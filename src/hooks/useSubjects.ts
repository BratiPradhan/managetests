import { useEffect, useState } from 'react'
import { Subject } from '@/types'
import { getSubjects } from '@/services/subject.service'

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch(() => setError('Failed to load subjects'))
      .finally(() => setLoading(false))
  }, [])

  return { subjects, loading, error }
}
