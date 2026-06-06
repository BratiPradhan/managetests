import { useQuery } from '@tanstack/react-query'
import { getTestById } from '@/services/test.service'
import { QUERY_KEYS } from '@/lib/query-keys'

export function useEditTest(id: string) {
  const { data: test = null, isLoading: loading, error } = useQuery({
    queryKey: QUERY_KEYS.test(id),
    queryFn: () => getTestById(id),
    enabled: !!id,
  })

  return {
    test,
    loading,
    error: error ? 'Failed to load test.' : null,
  }
}
