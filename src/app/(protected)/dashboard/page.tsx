"use client";

import { useDashboard } from "@/hooks/pages/useDashboard";
import TestTable from "@/components/dashboard/TestTable";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const {
    tests,
    totalTests,
    loading,
    error,
    fetchTests,
    goToCreate,
    currentPage,
    totalPages,
    pageSize,
    handlePageChange,
  } = useDashboard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalTests} test{totalTests !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          className="bg-brand text-white hover:bg-brand/90"
          onClick={goToCreate}
        >
          + Create New Test
        </Button>
      </div>

      {loading && (
        <div className="text-center py-16 text-muted-foreground">
          Loading tests...
        </div>
      )}
      {error && (
        <div className="text-center py-16 text-destructive">{error}</div>
      )}
      {!loading && !error && (
        <>
          <TestTable tests={tests} onDeleted={fetchTests} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalTests}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
