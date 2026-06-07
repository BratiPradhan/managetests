import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getTests } from '@/services/test.service'
import { QUERY_KEYS } from '@/lib/query-keys'
import { PAGE_SIZE } from '@/lib/constants'

export function useDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const [currentPage, setCurrentPage] = useState(1)
  const [prevQuery, setPrevQuery] = useState(query)

  // Reset to page 1 whenever the search query changes (React's
  // "adjusting state when a prop changes" pattern — avoids an effect).
  if (query !== prevQuery) {
    setPrevQuery(query)
    setCurrentPage(1)
  }

  const { data: allTests = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.tests,
    queryFn: getTests,
  })

  const filteredTests = useMemo(
    () =>
      query
        ? allTests.filter((test) => test.name.toLowerCase().includes(query.toLowerCase()))
        : allTests,
    [allTests, query]
  )

  const totalPages = Math.ceil(filteredTests.length / PAGE_SIZE)

  const paginatedTests = useMemo(
    () => filteredTests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredTests, currentPage]
  )

  const fetchTests = useCallback(() => {
    setCurrentPage(1)
    refetch()
  }, [refetch])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goToCreate = useCallback(() => router.push('/tests/create'), [router])

  return {
    tests: paginatedTests,
    totalTests: allTests.length,
    loading,
    error: error ? 'Failed to load tests. Please try again.' : null,
    fetchTests,
    goToCreate,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    handlePageChange,
  }
}
