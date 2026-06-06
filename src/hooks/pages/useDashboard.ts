import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getTests } from '@/services/test.service'
import { QUERY_KEYS } from '@/lib/query-keys'
import { PAGE_SIZE } from '@/lib/constants'

export function useDashboard() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const { data: allTests = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.tests,
    queryFn: getTests,
  })

  const totalPages = Math.ceil(allTests.length / PAGE_SIZE)

  const paginatedTests = useMemo(
    () => allTests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [allTests, currentPage]
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
