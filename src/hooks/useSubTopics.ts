import { useQuery } from '@tanstack/react-query'
import { getSubTopicsByTopicIds } from '@/services/subject.service'
import { QUERY_KEYS } from '@/lib/query-keys'

export const useSubTopics = (topicIds: string[]) => {
  const sortedIds = [...topicIds].sort()

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.subTopics(sortedIds),
    queryFn: () => getSubTopicsByTopicIds(sortedIds),
    enabled: sortedIds.length > 0,
  })

  return {
    subTopics: data ?? [],
    loading: isLoading,
  }
}
