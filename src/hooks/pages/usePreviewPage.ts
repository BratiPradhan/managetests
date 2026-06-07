import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getTestById, publishTest } from '@/services/test.service'
import { fetchBulkQuestions } from '@/services/question.service'
import { useTestFlowStore } from '@/store/testFlow.store'
import { queryClient } from '@/lib/query-client'
import { QUERY_KEYS } from '@/lib/query-keys'

export function usePreviewPage(id: string) {
  const router = useRouter()
  const reset = useTestFlowStore((s) => s.reset)
  const [published, setPublished] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: test = null, isLoading: testLoading } = useQuery({
    queryKey: QUERY_KEYS.test(id),
    queryFn: () => getTestById(id),
    enabled: !!id,
  })

  const questionIds = test?.questions ?? []
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: QUERY_KEYS.questions(questionIds),
    queryFn: () => fetchBulkQuestions(questionIds),
    enabled: questionIds.length > 0,
  })

  const { mutate: publish, isPending: publishing } = useMutation({
    mutationFn: () => publishTest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tests })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.test(id) })
      setPublished(true)
      reset()
      setTimeout(() => router.push('/dashboard'), 1500)
    },
    onError: () => setError('Failed to publish. Please try again.'),
  })

  const handlePublish = useCallback(() => {
    setError(null)
    publish()
  }, [publish])

  const goToEdit = useCallback(() => router.push(`/tests/${id}/edit`), [id, router])
  const goToQuestions = useCallback(() => router.push(`/tests/${id}/questions`), [id, router])

  return {
    test,
    questions,
    loading: testLoading || questionsLoading,
    publishing,
    published,
    error,
    handlePublish,
    goToEdit,
    goToQuestions,
  }
}
