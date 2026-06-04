import { useEffect, useState } from 'react'
import { SubTopic } from '@/types'
import { getSubTopicsByTopicIds } from '@/services/subject.service'

export const useSubTopics = (topicIds: string[]) => {
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!topicIds.length) {
      setSubTopics([])
      return
    }
    setLoading(true)
    getSubTopicsByTopicIds(topicIds)
      .then(setSubTopics)
      .catch(() => setSubTopics([]))
      .finally(() => setLoading(false))
  }, [JSON.stringify(topicIds)])

  return { subTopics, loading }
}
