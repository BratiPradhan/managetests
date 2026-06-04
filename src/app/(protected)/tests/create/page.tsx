import TestForm from '@/components/tests/TestForm'

export default function CreateTestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Test</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the details to create a new test</p>
      </div>
      <div className="bg-background rounded-lg border p-6">
        <TestForm />
      </div>
    </div>
  )
}
