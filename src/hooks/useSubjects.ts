import { useQuery } from '@tanstack/react-query'
import { getSubjects } from '@/services/subject.service'
import { QUERY_KEYS } from '@/lib/query-keys'

export const useSubjects = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.subjects,
    queryFn: getSubjects,
  })

  return {
    subjects: data ?? [],
    loading: isLoading,
    error: error ? 'Failed to load subjects' : null,
  }
}
