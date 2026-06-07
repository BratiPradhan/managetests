'use client'

import { useState } from 'react'
import { ChevronsLeft, ChevronsRight, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Question } from '@/types'

interface QuestionSidebarProps {
  questions: Question[]
  totalQuestions: number
  currentIndex: number | null
  onSelect: (index: number) => void
  onAddQuestion: () => void
}

export default function QuestionSidebar({
  questions,
  totalQuestions,
  currentIndex,
  onSelect,
  onAddQuestion,
}: QuestionSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const slots = Array.from({ length: Math.max(totalQuestions, questions.length) }, (_, i) => i)
  const isFilled = (i: number) => !!questions[i]?.question

  if (collapsed) {
    return (
      <div className="w-10 bg-white rounded-xl border border-gray-100 flex flex-col items-center pt-3 shrink-0 self-start">
        <button
          onClick={() => setCollapsed(false)}
          className="text-brand hover:text-brand/80"
          aria-label="Expand question list"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-56 bg-white rounded-xl border border-gray-100 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">Question creation</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-brand hover:text-brand/80"
          aria-label="Collapse question list"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2.5 border-b border-gray-100">
        <p className="text-sm text-gray-500">
          Total Questions <span className="text-gray-300 mx-1">.</span>
          <span className="font-semibold text-gray-800">{totalQuestions}</span>
        </p>
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {slots.map((i) => {
          const filled = isFilled(i)
          const active = i === currentIndex
          const itemClasses = cn(
            'w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors',
            filled
              ? 'border-green-200 bg-green-50/60'
              : 'border-gray-100 text-gray-400',
          )

          const content = (
            <>
              <span
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                  filled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400',
                )}
              >
                {filled ? <Check className="w-3 h-3" /> : <span className="w-2 h-0.5 rounded-full bg-current" />}
              </span>
              <span
                className={cn(
                  'flex-1 truncate text-sm',
                  active
                    ? 'text-brand font-medium underline underline-offset-4 decoration-2'
                    : filled
                      ? 'text-green-700'
                      : 'text-gray-400',
                )}
              >
                Question {i + 1}
              </span>
              <ChevronsRight className={cn('w-3.5 h-3.5 shrink-0', filled ? 'text-green-500' : 'text-gray-300')} />
            </>
          )

          if (!filled) {
            return (
              <div key={i} className={itemClasses} aria-disabled>
                {content}
              </div>
            )
          }

          return (
            <button key={i} onClick={() => onSelect(i)} className={cn(itemClasses, 'hover:bg-green-50 cursor-pointer')}>
              {content}
            </button>
          )
        })}
      </div>

      {/* Add new question */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onAddQuestion}
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand/40 text-brand text-sm font-medium py-2 hover:bg-brand/5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Question
        </button>
      </div>
    </div>
  )
}
