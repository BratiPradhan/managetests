'use client'

import { useDashboard } from '@/hooks/pages/useDashboard'
import TestTable from '@/components/dashboard/TestTable'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { tests, loading, error, fetchTests, goToCreate } = useDashboard()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tests.length} test{tests.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={goToCreate}>+ Create New Test</Button>
      </div>

      {loading && (
        <div className="text-center py-16 text-muted-foreground">Loading tests...</div>
      )}
      {error && (
        <div className="text-center py-16 text-destructive">{error}</div>
      )}
      {!loading && !error && (
        <TestTable tests={tests} onDeleted={fetchTests} />
      )}
    </div>
  )
}
