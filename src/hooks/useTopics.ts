import { useEffect, useState } from 'react'
import { Topic } from '@/types'
import { getTopicsBySubject } from '@/services/subject.service'

export const useTopics = (subjectId: string | null) => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!subjectId) {
      setTopics([])
      return
    }
    setLoading(true)
    getTopicsBySubject(subjectId)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setLoading(false))
  }, [subjectId])

  return { topics, loading }
}
