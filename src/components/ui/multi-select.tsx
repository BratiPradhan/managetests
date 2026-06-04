'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled,
}: MultiSelectProps) {
  const toggle = (optValue: string, checked: boolean) => {
    onChange(checked ? [...value, optValue] : value.filter((v) => v !== optValue))
  }

  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label)

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-between font-normal')}
        >
          <span className="text-muted-foreground">
            {value.length === 0 ? placeholder : `${value.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No options available</p>
          ) : (
            options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) => toggle(option.value, checked)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label) => (
            <Badge key={label} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
