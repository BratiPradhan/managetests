'use client'

import { Test, Question } from '@/types'
import { Badge } from '@/components/ui/badge'

interface TestPreviewProps {
  test: Test
  questions: Question[]
}

const OPTION_KEYS = ['option1', 'option2', 'option3', 'option4'] as const

export default function TestPreview({ test, questions }: TestPreviewProps) {
  return (
    <div className="space-y-8">
      {/* Test details card */}
      <div className="bg-background border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">{test.name}</h2>
            <p className="text-sm text-muted-foreground mt-1 capitalize">{test.type} test</p>
          </div>
          <Badge variant={test.status === 'live' ? 'default' : 'secondary'} className="capitalize">
            {test.status ?? 'draft'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
          <Stat label="Total Marks" value={test.total_marks} />
          <Stat label="Total Questions" value={test.total_questions} />
          <Stat label="Duration" value={`${test.total_time} mins`} />
          <Stat label="Difficulty" value={test.difficulty} capitalize />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <Stat label="Correct Marks" value={`+${test.correct_marks}`} />
          <Stat label="Wrong Marks" value={test.wrong_marks} />
          <Stat label="Unattempted" value={test.unattempt_marks} />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <h2 className="font-semibold text-base">
          Questions{' '}
          <span className="text-muted-foreground font-normal">({questions.length})</span>
        </h2>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
            No questions added yet.
          </p>
        ) : (
          questions.map((q, i) => (
            <div key={q.id ?? i} className="bg-background border rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-muted-foreground">Q{i + 1}.</span>
                {q.difficulty && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {q.difficulty}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium">{q.question}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {OPTION_KEYS.map((key, idx) => (
                  <div
                    key={key}
                    className={`text-sm px-3 py-2 rounded-md border ${
                      q.correct_option === key
                        ? 'bg-green-50 border-green-300 text-green-800 font-medium'
                        : 'bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <span className="font-medium mr-1">{idx + 1}.</span>
                    {q[key]}
                    {q.correct_option === key && (
                      <span className="ml-2 text-xs text-green-600">✓ correct</span>
                    )}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <p className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">
                  <span className="font-medium">Explanation:</span> {q.explanation}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  capitalize,
}: {
  label: string
  value: string | number
  capitalize?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
    </div>
  )
}
