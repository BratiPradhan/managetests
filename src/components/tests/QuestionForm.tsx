"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  questionSchema,
  QuestionFormValues,
} from "@/lib/validations/question.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];
const CORRECT_OPTIONS = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
  { value: "option4", label: "Option 4" },
];

interface QuestionFormProps {
  defaultValues?: Partial<QuestionFormValues>;
  isEditing?: boolean;
  onSubmit: (values: QuestionFormValues) => void;
  onCancel?: () => void;
}

export default function QuestionForm({
  defaultValues,
  isEditing = false,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
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
      form.reset({ ...form.formState.defaultValues, ...defaultValues });
    }
  }, [defaultValues]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    if (!isEditing) form.reset();
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Question text */}
      <div className="space-y-1">
        <Label>Question </Label>
        <Textarea
          placeholder="Enter the question..."
          rows={3}
          {...form.register("question")}
        />
        {form.formState.errors.question && (
          <p className="text-xs text-destructive">
            {form.formState.errors.question.message}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["option1", "option2", "option3", "option4"] as const).map(
          (key, i) => (
            <div key={key} className="space-y-1">
              <Label>Option {i + 1} </Label>
              <Input placeholder={`Option ${i + 1}`} {...form.register(key)} />
              {form.formState.errors[key] && (
                <p className="text-xs text-destructive">
                  {form.formState.errors[key]?.message}
                </p>
              )}
            </div>
          ),
        )}
      </div>

      {/* Correct option */}
      <div className="space-y-1">
        <Label>Correct Option </Label>
        <Controller
          control={form.control}
          name="correct_option"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {CORRECT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.correct_option && (
          <p className="text-xs text-destructive">
            {form.formState.errors.correct_option.message}
          </p>
        )}
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Difficulty </Label>
          <Controller
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
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
        </div>

        <div className="space-y-1">
          <Label>Media URL </Label>
          <Input placeholder="https://..." {...form.register("media_url")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Explanation </Label>
        <Textarea
          placeholder="Explain the correct answer..."
          rows={2}
          {...form.register("explanation")}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {isEditing ? "Update Question" : "Add Question"}
        </Button>
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
