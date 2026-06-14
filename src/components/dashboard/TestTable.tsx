'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DeleteTestDialog from './DeleteTestDialog'
import { Test } from '@/types'
import { getSubjectName } from '@/lib/resolveNames'

interface TestTableProps {
  tests: Test[]
  onDeleted: () => void
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: Test['status'] }) {
  return (
    <Badge variant={status === 'live' ? 'default' : 'secondary'} className="capitalize">
      {status ?? 'draft'}
    </Badge>
  )
}

export default function TestTable({ tests, onDeleted }: TestTableProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  if (tests.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No tests yet. Create your first test to get started.
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table (md+) ─────────────────────────────────── */}
      <div className="hidden md:block rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.name}</TableCell>
                <TableCell>
                  {getSubjectName(test.subject)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={test.status} />
                </TableCell>
                <TableCell>{formatDate(test.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => router.push(`/tests/${test.id}/edit`)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/tests/${test.id}/preview`)}>
                    View
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget({ id: test.id, name: test.name })}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile cards (< md) ─────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {tests.map((test) => (
          <div key={test.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{test.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {getSubjectName(test.subject)}
                </p>
              </div>
              <StatusBadge status={test.status} />
            </div>

            <p className="text-xs text-gray-400">{formatDate(test.created_at)}</p>

            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/tests/${test.id}/edit`)}>
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/tests/${test.id}/preview`)}>
                View
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => setDeleteTarget({ id: test.id, name: test.name })}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {deleteTarget && (
        <DeleteTestDialog
          testId={deleteTarget.id}
          testName={deleteTarget.name}
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={onDeleted}
        />
      )}
    </>
  )
}
