'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteTest } from '@/services/test.service'

interface DeleteTestDialogProps {
  testId: string
  testName: string
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteTestDialog({
  testId,
  testName,
  open,
  onClose,
  onDeleted,
}: DeleteTestDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteTest(testId)
      onDeleted()
    } catch {
      // silently close — parent will refresh
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Test</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{testName}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
