'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Question } from '@/types'

interface QuestionSidebarProps {
  questions: Question[]
  totalQuestions: number
  currentIndex: number
  onSelect: (index: number) => void
}

export default function QuestionSidebar({
  questions,
  totalQuestions,
  currentIndex,
  onSelect,
}: QuestionSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const slots = Array.from({ length: Math.max(totalQuestions, questions.length) }, (_, i) => i)
  const isFilled = (i: number) => {
    const q = questions[i]
    return !!q?.question
  }

  if (collapsed) {
    return (
      <div className="w-8 border-r border-gray-100 bg-white flex flex-col items-center pt-4 shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="text-blue-500 hover:text-blue-600"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-48 border-r border-gray-100 bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">Question creation</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-blue-500 hover:text-blue-600"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-xs text-gray-500">
          Total Questions : <span className="font-medium text-gray-700">{totalQuestions}</span>
        </p>
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto py-2">
        {slots.map((i) => {
          const filled = isFilled(i)
          const active = i === currentIndex
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
                active ? 'bg-blue-50' : 'hover:bg-gray-50'
              )}
            >
              <span
                className={cn(
                  'w-2.5 h-2.5 rounded-full shrink-0',
                  filled ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
              <span className={cn('flex-1 truncate text-xs', active ? 'text-blue-600 font-medium' : 'text-gray-600')}>
                {questions[i]?.question
                  ? questions[i].question.slice(0, 20) + (questions[i].question.length > 20 ? '…' : '')
                  : `Question ${i + 1}`}
              </span>
              {filled && <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
