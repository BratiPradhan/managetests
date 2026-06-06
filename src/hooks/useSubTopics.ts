import { useQuery } from '@tanstack/react-query'
import { getSubTopicsByTopic } from '@/services/subject.service'
import { QUERY_KEYS } from '@/lib/query-keys'

export const useSubTopics = (topicIds: string[]) => {
  const topicId = topicIds[0] ?? ''

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.subTopics(topicId),
    queryFn: () => getSubTopicsByTopic(topicId),
    enabled: !!topicId,
  })

  return {
    subTopics: data ?? [],
    loading: isLoading,
  }
}
