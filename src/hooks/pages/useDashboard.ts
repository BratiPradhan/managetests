import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTests } from "@/services/test.service";
import { Test } from "@/types";
import { PAGE_SIZE } from "../../../constants";

export function useDashboard() {
  const router = useRouter();
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTests = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getTests();
      setAllTests(data);
      setCurrentPage(1);
    } catch {
      setError("Failed to load tests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchTests(false), 0);
    return () => clearTimeout(t);
  }, [fetchTests]);

  const totalPages = Math.ceil(allTests.length / PAGE_SIZE);

  const paginatedTests = useMemo(
    () =>
      allTests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [allTests, currentPage],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToCreate = useCallback(() => router.push("/tests/create"), [router]);

  return {
    tests: paginatedTests,
    totalTests: allTests.length,
    loading,
    error,
    fetchTests,
    goToCreate,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    handlePageChange,
  };
}
