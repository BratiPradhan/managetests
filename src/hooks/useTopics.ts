import { useQuery } from '@tanstack/react-query'
import { getTopicsBySubject } from '@/services/subject.service'
import { QUERY_KEYS } from '@/lib/query-keys'

export const useTopics = (subjectId: string | null) => {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.topics(subjectId ?? ''),
    queryFn: () => getTopicsBySubject(subjectId!),
    enabled: !!subjectId,
  })

  return {
    topics: data ?? [],
    loading: isLoading,
  }
}
