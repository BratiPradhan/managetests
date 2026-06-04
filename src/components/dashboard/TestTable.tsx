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

interface TestTableProps {
  tests: Test[]
  onDeleted: () => void
}

export default function TestTable({ tests, onDeleted }: TestTableProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No tests yet. Create your first test to get started.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border bg-background">
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
                <TableCell>{typeof test.subject === 'string' ? test.subject : (test.subject as { name?: string })?.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={test.status === 'live' ? 'default' : 'secondary'}>
                    {test.status ?? 'draft'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(test.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/tests/${test.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/tests/${test.id}/preview`)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget({ id: test.id, name: test.name })}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
