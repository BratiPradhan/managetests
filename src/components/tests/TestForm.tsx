'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { testSchema, TestFormValues } from '@/lib/validations/test.schema'
import { createTest, updateTest } from '@/services/test.service'
import { useSubjects } from '@/hooks/useSubjects'
import { useTopics } from '@/hooks/useTopics'
import { useSubTopics } from '@/hooks/useSubTopics'
import { useTestFlowStore } from '@/store/testFlow.store'
import { Test } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import MultiSelect from '@/components/ui/multi-select'

const TEST_TYPES = ['practice', 'mock', 'final']
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard']

interface TestFormProps {
  initialData?: Test
  testId?: string
}

export default function TestForm({ initialData, testId }: TestFormProps) {
  const router = useRouter()
  const setStoreTestId = useTestFlowStore((s) => s.setTestId)
  const setTestData = useTestFlowStore((s) => s.setTestData)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { subjects, loading: subjectsLoading } = useSubjects()

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      type: '',
      subject: '',
      topics: [] as string[],
      sub_topics: [] as string[],
      difficulty: '',
      correct_marks: 4,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 100,
      total_questions: 25,
    },
  })

  const selectedSubject = form.watch('subject')
  const selectedTopics = form.watch('topics')

  const { topics, loading: topicsLoading } = useTopics(selectedSubject || null)
  const { subTopics, loading: subTopicsLoading } = useSubTopics(selectedTopics || [])

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        type: initialData.type,
        subject: initialData.subject,
        topics: initialData.topics ?? [],
        sub_topics: initialData.sub_topics ?? [],
        difficulty: initialData.difficulty,
        correct_marks: initialData.correct_marks,
        wrong_marks: initialData.wrong_marks,
        unattempt_marks: initialData.unattempt_marks,
        total_time: initialData.total_time,
        total_marks: initialData.total_marks,
        total_questions: initialData.total_questions,
      })
    }
  }, [initialData, form])

  const save = async (values: TestFormValues) => {
    if (testId) {
      await updateTest(testId, values)
      return testId
    }
    const test = await createTest({ ...values, status: null })
    return test.id
  }

  const handleSaveDraft = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const id = await save(values)
      setStoreTestId(id)
      router.push('/dashboard')
    } catch {
      setSubmitError('Failed to save. Please try again.')
    }
  })

  const handleNext = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      const id = await save(values)
      setStoreTestId(id)
      setTestData(values as Partial<Test>)
      router.push(`/tests/${id}/questions`)
    } catch {
      setSubmitError('Failed to save. Please try again.')
    }
  })

  const { isSubmitting } = form.formState

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Test Name *</Label>
          <Input placeholder="e.g. Physics Mock Test" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Test Type *</Label>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.type && (
            <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Subject → Topics → Sub-topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Subject *</Label>
          <Controller
            control={form.control}
            name="subject"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  form.setValue('topics', [])
                  form.setValue('sub_topics', [])
                }}
                disabled={subjectsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={subjectsLoading ? 'Loading...' : 'Select subject'} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.subject && (
            <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Topics *</Label>
          <Controller
            control={form.control}
            name="topics"
            render={({ field }) => (
              <MultiSelect
                options={topics.map((t) => ({ value: t.id, label: t.name }))}
                value={field.value}
                onChange={(vals) => {
                  field.onChange(vals)
                  form.setValue('sub_topics', [])
                }}
                placeholder={
                  !selectedSubject
                    ? 'Select subject first'
                    : topicsLoading
                    ? 'Loading...'
                    : 'Select topics'
                }
                disabled={!selectedSubject || topicsLoading}
              />
            )}
          />
          {form.formState.errors.topics && (
            <p className="text-xs text-destructive">{form.formState.errors.topics.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Sub-topics</Label>
          <Controller
            control={form.control}
            name="sub_topics"
            render={({ field }) => (
              <MultiSelect
                options={subTopics.map((st) => ({ value: st.id, label: st.name }))}
                value={field.value}
                onChange={field.onChange}
                placeholder={
                  !selectedTopics?.length
                    ? 'Select topics first'
                    : subTopicsLoading
                    ? 'Loading...'
                    : 'Select sub-topics'
                }
                disabled={!selectedTopics?.length || subTopicsLoading}
              />
            )}
          />
        </div>
      </div>

      {/* Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Difficulty *</Label>
          <Controller
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.difficulty && (
            <p className="text-xs text-destructive">{form.formState.errors.difficulty.message}</p>
          )}
        </div>
      </div>

      {/* Marking scheme */}
      <div>
        <h3 className="text-sm font-medium mb-3">Marking Scheme</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Correct Marks</Label>
            <Input type="number" {...form.register('correct_marks', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label>Wrong Marks</Label>
            <Input type="number" {...form.register('wrong_marks', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label>Unattempted Marks</Label>
            <Input type="number" {...form.register('unattempt_marks', { valueAsNumber: true })} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-medium mb-3">Test Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Total Time (mins)</Label>
            <Input type="number" {...form.register('total_time', { valueAsNumber: true })} />
            {form.formState.errors.total_time && (
              <p className="text-xs text-destructive">{form.formState.errors.total_time.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Total Marks</Label>
            <Input type="number" {...form.register('total_marks', { valueAsNumber: true })} />
            {form.formState.errors.total_marks && (
              <p className="text-xs text-destructive">{form.formState.errors.total_marks.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Total Questions</Label>
            <Input type="number" {...form.register('total_questions', { valueAsNumber: true })} />
            {form.formState.errors.total_questions && (
              <p className="text-xs text-destructive">
                {form.formState.errors.total_questions.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Next: Add Questions →'}
        </Button>
      </div>
    </form>
  )
}
