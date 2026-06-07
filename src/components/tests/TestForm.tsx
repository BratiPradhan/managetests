"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ChevronUp, ChevronDown } from "lucide-react";
import { testSchema, TestFormValues } from "@/lib/validations/test.schema";
import { createTest, updateTest } from "@/services/test.service";
import { useSubjects } from "@/hooks/useSubjects";
import { useTopics } from "@/hooks/useTopics";
import { useSubTopics } from "@/hooks/useSubTopics";
import { useTestFlowStore } from "@/store/testFlow.store";
import { Test } from "@/types";
import { cn } from "@/lib/utils";
import SelectEmpty from "@/components/ui/select-empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TEST_TABS = [
  { label: "Chapter Wise", value: "chapterwise" },
  { label: "PYQ", value: "pyq" },
  { label: "Mock Test", value: "mock" },
];

const DIFFICULTIES = ["Easy", "Medium", "Difficult"];

interface TestFormProps {
  initialData?: Test;
  testId?: string;
}

// ── Number Spinner ───────────────────────────────────────────────────────────
function NumberSpinner({
  value,
  onChange,
  showSign = false,
}: {
  value: number;
  onChange: (v: number) => void;
  showSign?: boolean;
}) {
  const display = showSign && value >= 0 ? `+${value}` : `${value}`;
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-28 h-11 bg-white">
      <span className="flex-1 px-3 text-sm text-gray-800 select-none">
        {display}
      </span>
      <div className="flex flex-col border-l border-gray-200 h-full">
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex-1 flex items-center justify-center px-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronUp className="w-3 h-3 text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          className="flex-1 flex items-center justify-center px-2 hover:bg-gray-50 border-t border-gray-200 transition-colors"
        >
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (val: string) => UUID_REGEX.test(val);

// ── Main component ────────────────────────────────────────────────────────────
export default function TestForm({ initialData, testId }: TestFormProps) {
  const router = useRouter();
  const setStoreTestId = useTestFlowStore((s) => s.setTestId);
  const setTestData = useTestFlowStore((s) => s.setTestData);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { subjects, loading: subjectsLoading } = useSubjects();

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: "",
      type: "chapterwise",
      subject: "",
      topic: "",
      sub_topic: "",
      difficulty: "easy",
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: 60,
      total_marks: 250,
      total_questions: 50,
    },
  });

  const {
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const selectedSubject = useWatch({ control: form.control, name: "subject" });
  const selectedTopic = useWatch({ control: form.control, name: "topic" });

  const { topics, loading: topicsLoading } = useTopics(
    isUUID(selectedSubject) ? selectedSubject : null,
  );
  const { subTopics, loading: subTopicsLoading } = useSubTopics(
    isUUID(selectedTopic) ? [selectedTopic] : [],
  );

  // Refs holding raw name strings from initialData — used to resolve name→UUID after data loads
  const pendingSubjectName = useRef<string | null>(null);
  const pendingTopicName = useRef<string | null>(null);
  const pendingSubTopicName = useRef<string | null>(null);

  // Clear downstream fields when subject changes (fetch is handled by useTopics)
  useEffect(() => {
    if (!isUUID(selectedSubject)) return;
    setValue("topic", "");
    setValue("sub_topic", "");
  }, [selectedSubject, setValue]);

  // Clear sub_topic when topic changes (fetch is handled by useSubTopics)
  useEffect(() => {
    if (!isUUID(selectedTopic)) return;
    setValue("sub_topic", "");
  }, [selectedTopic, setValue]);

  // Pre-populate for edit mode — store names in refs for UUID resolution below
  useEffect(() => {
    if (!initialData) return;
    pendingSubjectName.current = initialData.subject;
    pendingTopicName.current = initialData.topics?.[0] ?? null;
    pendingSubTopicName.current = initialData.sub_topics?.[0] ?? null;
    form.reset({
      name: initialData.name,
      type: initialData.type,
      subject: initialData.subject,
      topic: initialData.topics?.[0] ?? "",
      sub_topic: initialData.sub_topics?.[0] ?? "",
      difficulty: initialData.difficulty,
      correct_marks: initialData.correct_marks,
      wrong_marks: initialData.wrong_marks,
      unattempt_marks: initialData.unattempt_marks,
      total_time: initialData.total_time,
      total_marks: initialData.total_marks,
      total_questions: initialData.total_questions,
    });
  }, [initialData, form]);

  // Resolve subject name → UUID once subjects are loaded
  useEffect(() => {
    const name = pendingSubjectName.current;
    if (!name || subjects.length === 0) return;
    const match = subjects.find((s) => s.name === name || s.id === name);
    if (match && !isUUID(name)) {
      setValue("subject", match.id);
      pendingSubjectName.current = null;
    }
  }, [subjects, setValue]);

  // Resolve topic name → UUID once topics are loaded
  useEffect(() => {
    const name = pendingTopicName.current;
    if (!name || topics.length === 0) return;
    const match = topics.find((t) => t.name === name || t.id === name);
    if (match && !isUUID(name)) {
      setValue("topic", match.id);
      pendingTopicName.current = null;
    }
  }, [topics, setValue]);

  // Resolve sub-topic name → UUID once sub-topics are loaded
  useEffect(() => {
    const name = pendingSubTopicName.current;
    if (!name || subTopics.length === 0) return;
    const match = subTopics.find((st) => st.name === name || st.id === name);
    if (match && !isUUID(name)) {
      setValue("sub_topic", match.id);
      pendingSubTopicName.current = null;
    }
  }, [subTopics, setValue]);

  const buildPayload = (values: TestFormValues) => ({
    name: values.name,
    type: values.type,
    subject: values.subject,
    topics: values.topic ? [values.topic] : [],
    ...(values.sub_topic ? { sub_topics: [values.sub_topic] } : {}),
    difficulty: values.difficulty,
    correct_marks: values.correct_marks,
    wrong_marks: values.wrong_marks,
    unattempt_marks: values.unattempt_marks,
    total_time: values.total_time,
    total_marks: values.total_marks,
    total_questions: values.total_questions,
    status: "draft" as const,
  });

  const { mutateAsync: saveTest } = useMutation({
    mutationFn: async (values: TestFormValues) => {
      const payload = buildPayload(values);
      if (testId) {
        await updateTest(testId, payload);
        return testId;
      }
      const test = await createTest(payload);
      return test.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.test(id) });
    },
    onError: () => setSubmitError("Failed to save. Please try again."),
  });

  const handleNext = form.handleSubmit(async (values) => {
    setSubmitError(null);
    const id = await saveTest(values);
    setStoreTestId(id);
    setTestData(values as Partial<Test>);
    router.push(`/tests/${id}/questions`);
  });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      {/* Tab switcher */}
      <Controller
        control={form.control}
        name="type"
        render={({ field }) => (
          <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden">
            {TEST_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => field.onChange(tab.value)}
                className={cn(
                  "px-5 py-2 text-sm font-medium transition-colors",
                  field.value === tab.value
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      />

      {/* Row 1: Subject + Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Subject" error={errors.subject?.message}>
          <Controller
            control={form.control}
            name="subject"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={subjectsLoading}
              >
                <SelectTrigger className="h-11 border-gray-200 text-gray-500">
                  <SelectValue placeholder="Choose from Drop-down">
                    {field.value
                      ? (subjects.find((s) => s.id === field.value)?.name ??
                        null)
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <SelectEmpty />
                  ) : (
                    subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Name of Test" error={errors.name?.message}>
          <input
            placeholder="Enter name of Test"
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            {...form.register("name")}
          />
        </Field>
      </div>

      {/* Row 2: Topic + Sub Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Topic" error={errors.topic?.message}>
          <Controller
            control={form.control}
            name="topic"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedSubject || topicsLoading}
              >
                <SelectTrigger className="h-11 border-gray-200 text-gray-500">
                  <SelectValue
                    placeholder={
                      topicsLoading ? "Loading..." : "Choose from Drop-down"
                    }
                  >
                    {field.value
                      ? (topics.find((t) => t.id === field.value)?.name ?? null)
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {topics.length === 0 ? (
                    <SelectEmpty
                      message={
                        topicsLoading ? "Loading..." : "No records found"
                      }
                    />
                  ) : (
                    topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Sub Topic">
          <Controller
            control={form.control}
            name="sub_topic"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={!selectedTopic || subTopicsLoading}
              >
                <SelectTrigger className="h-11 border-gray-200 text-gray-500">
                  <SelectValue
                    placeholder={
                      subTopicsLoading ? "Loading..." : "Choose from Drop-down"
                    }
                  >
                    {field.value
                      ? (subTopics.find((st) => st.id === field.value)?.name ??
                        null)
                      : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subTopics.length === 0 ? (
                    <SelectEmpty
                      message={
                        subTopicsLoading ? "Loading..." : "No records found"
                      }
                    />
                  ) : (
                    subTopics.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      {/* Row 3: Duration + Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Duration (Minutes)" error={errors.total_time?.message}>
          <input
            type="number"
            placeholder="Enter the time"
            className="w-full h-11 rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
            {...form.register("total_time", { valueAsNumber: true })}
          />
        </Field>

        <Field label="Test Difficulty Level" error={errors.difficulty?.message}>
          <Controller
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <div className="flex items-center gap-6 h-11">
                {DIFFICULTIES.map((d) => {
                  const val = d.toLowerCase();
                  const active = field.value === val;
                  return (
                    <label
                      key={d}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div
                        onClick={() => field.onChange(val)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer",
                          active ? "border-brand" : "border-gray-300",
                        )}
                      >
                        {active && (
                          <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{d}</span>
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Field>
      </div>

      {/* Marking Scheme */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700">Marking Scheme:</p>
        <div className="flex flex-wrap items-end gap-6">
          <div className="space-y-1.5">
            <p className="text-sm text-gray-600">Wrong Answer</p>
            <Controller
              control={form.control}
              name="wrong_marks"
              render={({ field }) => (
                <NumberSpinner
                  value={field.value}
                  onChange={field.onChange}
                  showSign
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-gray-600">Unattempted</p>
            <Controller
              control={form.control}
              name="unattempt_marks"
              render={({ field }) => (
                <NumberSpinner
                  value={field.value}
                  onChange={field.onChange}
                  showSign
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-gray-600">Correct Answer</p>
            <Controller
              control={form.control}
              name="correct_marks"
              render={({ field }) => (
                <NumberSpinner
                  value={field.value}
                  onChange={field.onChange}
                  showSign
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-gray-600">No of Questions</p>
            <input
              type="number"
              placeholder="Ex: 50"
              className="w-36 h-11 rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              {...form.register("total_questions", { valueAsNumber: true })}
            />
            {errors.total_questions && (
              <p className="text-xs text-red-500">
                {errors.total_questions.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-sm text-gray-400">Total Marks</p>
            <input
              type="number"
              placeholder="Ex: 250"
              className="w-36 h-11 rounded-lg border border-gray-200 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition"
              {...form.register("total_marks", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {submitError && <p className="text-sm text-red-500">{submitError}</p>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-sm font-medium text-brand hover:text-brandtransition-colors px-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-lg bg-brand hover:bg-brand/90 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
        >
          {isSubmitting ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}
