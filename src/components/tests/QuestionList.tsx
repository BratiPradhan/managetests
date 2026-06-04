'use client'

import { Question } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface QuestionListProps {
  questions: Question[]
  onEdit: (index: number) => void
  onDelete: (index: number) => void
}

const OPTION_LABELS: Record<string, string> = {
  option1: 'Option 1',
  option2: 'Option 2',
  option3: 'Option 3',
  option4: 'Option 4',
}

export default function QuestionList({ questions, onEdit, onDelete }: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
        No questions added yet. Use the form above to add your first question.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {questions.map((q, index) => (
        <div
          key={index}
          className="bg-background border rounded-lg p-4 flex items-start justify-between gap-4"
        >
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">Q{index + 1}</span>
              {q.difficulty && (
                <Badge variant="outline" className="text-xs capitalize">
                  {q.difficulty}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                Correct: {OPTION_LABELS[q.correct_option] ?? q.correct_option}
              </Badge>
            </div>
            <p className="text-sm font-medium line-clamp-2">{q.question}</p>
            <div className="grid grid-cols-2 gap-1">
              {(['option1', 'option2', 'option3', 'option4'] as const).map((key, i) => (
                <p
                  key={key}
                  className={`text-xs px-2 py-1 rounded ${
                    q.correct_option === key
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {i + 1}. {q[key]}
                </p>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(index)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(index)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
