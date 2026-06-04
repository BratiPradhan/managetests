"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTests } from "@/services/test.service";
import { Test } from "@/types";
import TestTable from "@/components/dashboard/TestTable";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTests = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getTests();
      setTests(data);
    } catch {
      setError("Failed to load tests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests(false);
  }, [fetchTests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tests.length} test{tests.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={() => router.push("/tests/create")}>
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

      {!loading && !error && <TestTable tests={tests} onDeleted={fetchTests} />}
    </div>
  );
}
