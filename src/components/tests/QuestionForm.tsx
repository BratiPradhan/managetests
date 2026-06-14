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
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  CORRECT_OPTIONS,
  CORRECT_OPTION_LABELS,
} from "@/lib/constants";

interface NamedOption {
  id: string;
  name: string;
}

interface QuestionFormProps {
  defaultValues?: Partial<QuestionFormValues>;
  isEditing?: boolean;
  topicOptions?: NamedOption[];
  subTopicOptions?: NamedOption[];
  onSubmit: (values: QuestionFormValues) => void;
  onCancel?: () => void;
}

export default function QuestionForm({
  defaultValues,
  isEditing = false,
  topicOptions,
  subTopicOptions,
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
      topic: "",
      sub_topic: "",
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
        <Label htmlFor="question">Question </Label>
        <Textarea
          id="question"
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
              <Label htmlFor={key}>Option {i + 1} </Label>
              <Input id={key} placeholder={`Option ${i + 1}`} {...form.register(key)} />
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
        <Label htmlFor="correct_option">Correct Option </Label>
        <Controller
          control={form.control}
          name="correct_option"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="correct_option">
                <SelectValue placeholder="Select correct option" />
              </SelectTrigger>
              <SelectContent>
                {CORRECT_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {CORRECT_OPTION_LABELS[o]}
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

      {/* Topic / Sub-topic */}
      {(topicOptions?.length || subTopicOptions?.length) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!!topicOptions?.length && (
            <div className="space-y-1">
              <Label htmlFor="topic">Topic </Label>
              <Controller
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select topic">
                        {field.value
                          ? (topicOptions.find((t) => t.id === field.value)?.name ?? null)
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {topicOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {!!subTopicOptions?.length && (
            <div className="space-y-1">
              <Label htmlFor="sub_topic">Sub-topic </Label>
              <Controller
                control={form.control}
                name="sub_topic"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger id="sub_topic">
                      <SelectValue placeholder="Select sub-topic">
                        {field.value
                          ? (subTopicOptions.find((st) => st.id === field.value)?.name ?? null)
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {subTopicOptions.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Optional fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="difficulty">Difficulty </Label>
          <Controller
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="media_url">Media URL </Label>
          <Input id="media_url" placeholder="https://..." {...form.register("media_url")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="explanation">Explanation </Label>
        <Textarea
          id="explanation"
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
