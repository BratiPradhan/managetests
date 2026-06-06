'use client'

import { useMutation } from '@tanstack/react-query'
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
import { queryClient } from '@/lib/query-client'
import { QUERY_KEYS } from '@/lib/query-keys'

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
  const { mutate: handleDelete, isPending: loading } = useMutation({
    mutationFn: () => deleteTest(testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tests })
      onDeleted()
      onClose()
    },
    onError: onClose,
  })

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
          <Button variant="destructive" onClick={() => handleDelete()} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
