"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Bold,
  Italic,
  Underline,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image,
} from "lucide-react";
import {
  questionSchema,
  QuestionFormValues,
} from "@/lib/validations/question.schema";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];
const OPTION_KEYS = ["option1", "option2", "option3", "option4"] as const;

interface TopicOption {
  value: string;
  label: string;
}

interface QuestionEditorProps {
  index: number;
  total: number;
  defaultValues?: Partial<QuestionFormValues>;
  topics: TopicOption[];
  onSave: (values: QuestionFormValues, index: number) => void;
  onNavigate: (newIndex: number) => void;
  onDeleteAll: () => void;
}

function ToolbarBtn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 text-xs font-medium transition-colors",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function QuestionEditor({
  index,
  total,
  defaultValues,
  onSave,
  onNavigate,
  onDeleteAll,
}: QuestionEditorProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_option: undefined,
      explanation: "",
      difficulty: "",
      media_url: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correct_option: undefined,
        explanation: "",
        difficulty: "",
        media_url: "",
        ...defaultValues,
      });
    }
  }, [defaultValues]);

  const saveAndNavigate = (newIndex: number) => {
    const values = form.getValues();
    onSave(values, index);
    onNavigate(newIndex);
  };

  const { errors } = form.formState;

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Question <span className="text-gray-900">{index + 1}</span>
          <span className="text-blue-500">/{total}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            + MCQ
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {/* Delete all edits */}
      <button
        type="button"
        onClick={onDeleteAll}
        className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete All Edits
      </button>

      {/* Question editor */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-white">
          <ToolbarBtn>
            <Italic className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn>
            <Bold className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn>
            <Underline className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarBtn>
            <Link2 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn>
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn>
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn>
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn>
            <AlignJustify className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarBtn>
            <Image className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="ml-auto">
            <ToolbarBtn>
              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
            </ToolbarBtn>
          </div>
        </div>
        {/* Text area */}
        <textarea
          placeholder="Type here"
          rows={4}
          className="w-full px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none"
          {...form.register("question")}
        />
      </div>
      {errors.question && (
        <p className="text-xs text-red-500 -mt-4">{errors.question.message}</p>
      )}

      {/* Options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Type the options below
        </p>
        {OPTION_KEYS.map((key, i) => (
          <Controller
            key={key}
            control={form.control}
            name="correct_option"
            render={({ field }) => (
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2.5">
                {/* Radio */}
                <button
                  type="button"
                  onClick={() => field.onChange(key)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    field.value === key ? "border-brand" : "border-gray-300",
                  )}
                >
                  {field.value === key && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                  )}
                </button>
                <input
                  placeholder={`Type Option here`}
                  className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                  {...form.register(key)}
                />
                <button
                  type="button"
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        ))}
        {errors.correct_option && (
          <p className="text-xs text-red-500">
            {errors.correct_option.message}
          </p>
        )}
      </div>

      {/* Solution */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Add Solution</p>
        <div className="border border-dashed border-purple-400 rounded-lg flex items-start px-3 py-2.5 gap-2">
          <textarea
            placeholder="Type here"
            rows={4}
            className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none resize-none"
            {...form.register("explanation")}
          />
          <button
            type="button"
            className="text-gray-300 hover:text-gray-500 mt-1 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-12 py-2">
        <button
          type="button"
          onClick={() => index > 0 && saveAndNavigate(index - 1)}
          disabled={index === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => saveAndNavigate(index + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Question settings */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-gray-800">Question settings</p>

        <div className="space-y-1.5">
          <p className="text-sm text-gray-600">Level of Difficulty</p>
          <Controller
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 border-gray-200 text-gray-500">
                  <SelectValue placeholder="Select from Drop-down" />
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
        </div>
      </div>
    </div>
  );
}
