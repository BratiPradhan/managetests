"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  TEST_TYPES,
  TEST_TYPE_LABELS,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { resolveName, resolveNames } from "@/lib/resolveNames";
import SelectEmpty from "@/components/ui/select-empty";
import MultiSelect from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestFormProps {
  initialData?: Test;
  testId?: string;
}

// ── Number Spinner ───────────────────────────────────────────────────────────
function NumberSpinner({
  label,
  value,
  onChange,
  showSign = false,
}: {
  label: string;
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
          aria-label={`Increase ${label}`}
          className="flex-1 flex items-center justify-center px-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronUp className="w-3 h-3 text-gray-400" />
        </button>
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          aria-label={`Decrease ${label}`}
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
      topics: [],
      sub_topics: [],
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
  const selectedTopics = useWatch({ control: form.control, name: "topics" });

  const { topics, loading: topicsLoading } = useTopics(
    isUUID(selectedSubject) ? selectedSubject : null,
  );
  const validTopicIds = useMemo(
    () => selectedTopics.filter(isUUID),
    [selectedTopics],
  );
  const { subTopics, loading: subTopicsLoading } = useSubTopics(validTopicIds);

  // Staged resolution of edit-mode names (subject/topics/sub_topics) to UUIDs
  // as each dependent dropdown's options load.
  const editResolution = useRef<{
    subjectName: string | null;
    topicNames: string[];
    subTopicNames: string[];
    stage: "subject" | "topics" | "subTopics";
  } | null>(null);

  // Clear topics/sub_topics when the user picks a different subject —
  // but not while edit-mode resolution is populating them
  useEffect(() => {
    if (!isUUID(selectedSubject)) return;
    const res = editResolution.current;
    if (res && (res.stage === "topics" || res.stage === "subTopics")) return;
    setValue("topics", []);
    setValue("sub_topics", []);
  }, [selectedSubject, setValue]);

  // Prune sub_topics to only IDs still present in the freshly-fetched subTopics list
  // when the topics selection changes — same guard
  useEffect(() => {
    const res = editResolution.current;
    if (res && (res.stage === "topics" || res.stage === "subTopics")) return;
    if (subTopicsLoading) return;
    const current = form.getValues("sub_topics");
    const validIds = new Set(subTopics.map((st) => st.id));
    const pruned = current.filter((id) => validIds.has(id));
    if (pruned.length !== current.length) setValue("sub_topics", pruned);
  }, [subTopics, subTopicsLoading, form, setValue]);

  // Stage 0 — capture raw names + pre-populate non-relational fields
  useEffect(() => {
    if (!initialData) return;
    editResolution.current = {
      subjectName: initialData.subject,
      topicNames: initialData.topics ?? [],
      subTopicNames: initialData.sub_topics ?? [],
      stage: "subject",
    };
    form.reset({
      name: initialData.name,
      type: initialData.type,
      subject: initialData.subject,
      topics: [],
      sub_topics: [],
      difficulty: initialData.difficulty,
      correct_marks: initialData.correct_marks,
      wrong_marks: initialData.wrong_marks,
      unattempt_marks: initialData.unattempt_marks,
      total_time: initialData.total_time,
      total_marks: initialData.total_marks,
      total_questions: initialData.total_questions,
    });
  }, [initialData, form]);

  // Stage 1 — subject name -> UUID once `subjects` loads
  useEffect(() => {
    const res = editResolution.current;
    if (!res || res.stage !== "subject" || subjects.length === 0) return;
    const match = resolveName(res.subjectName, subjects);
    if (!match) {
      editResolution.current = null;
      return;
    }
    setValue("subject", match.id);
    res.stage = "topics";
  }, [subjects, setValue]);

  // Stage 2 — topic names[] -> UUIDs[] once `topics` loads for the resolved subject
  useEffect(() => {
    const res = editResolution.current;
    if (!res || res.stage !== "topics" || topics.length === 0) return;
    const matches = resolveNames(res.topicNames, topics);
    setValue("topics", matches.map((t) => t.id));
    if (matches.length === 0 || res.subTopicNames.length === 0) {
      editResolution.current = null;
    } else {
      res.stage = "subTopics";
    }
  }, [topics, setValue]);

  // Stage 3 — sub-topic names[] -> UUIDs[] once `subTopics` loads for the resolved topics
  useEffect(() => {
    const res = editResolution.current;
    if (!res || res.stage !== "subTopics" || subTopics.length === 0) return;
    const matches = resolveNames(res.subTopicNames, subTopics);
    setValue("sub_topics", matches.map((st) => st.id));
    editResolution.current = null;
  }, [subTopics, setValue]);

  const buildPayload = (values: TestFormValues) => ({
    name: values.name,
    type: values.type,
    subject: values.subject,
    topics: values.topics,
    ...(values.sub_topics.length ? { sub_topics: values.sub_topics } : {}),
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
    <form onSubmit={handleNext} className="space-y-8">
      {/* Tab switcher */}
      <Controller
        control={form.control}
        name="type"
        render={({ field }) => (
          <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden">
            {TEST_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => field.onChange(type)}
                className={cn(
                  "px-5 py-2 text-sm font-medium transition-colors",
                  field.value === type
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                {TEST_TYPE_LABELS[type]}
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
        <Field label="Topic" error={errors.topics?.message}>
          <Controller
            control={form.control}
            name="topics"
            render={({ field }) => (
              <MultiSelect
                options={topics.map((t) => ({ value: t.id, label: t.name }))}
                value={field.value}
                onChange={field.onChange}
                disabled={!selectedSubject || topicsLoading}
                placeholder={
                  topicsLoading ? "Loading..." : "Choose from Drop-down"
                }
                emptyMessage={
                  topicsLoading
                    ? "Loading..."
                    : !selectedSubject
                      ? "Select a subject first"
                      : "No records found"
                }
              />
            )}
          />
        </Field>

        <Field label="Sub Topic">
          <Controller
            control={form.control}
            name="sub_topics"
            render={({ field }) => (
              <MultiSelect
                options={subTopics.map((st) => ({ value: st.id, label: st.name }))}
                value={field.value}
                onChange={field.onChange}
                disabled={selectedTopics.length === 0 || subTopicsLoading}
                placeholder={
                  subTopicsLoading ? "Loading..." : "Choose from Drop-down"
                }
                emptyMessage={
                  subTopicsLoading
                    ? "Loading..."
                    : selectedTopics.length === 0
                      ? "Select a topic first"
                      : "No records found"
                }
              />
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
                  const active = field.value === d;
                  return (
                    <label
                      key={d}
                      className="flex items-center gap-2 cursor-pointer select-none"
                    >
                      <div
                        onClick={() => field.onChange(d)}
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer",
                          active ? "border-brand" : "border-gray-300",
                        )}
                      >
                        {active && (
                          <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{DIFFICULTY_LABELS[d]}</span>
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
                  label="Wrong Answer"
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
                  label="Unattempted"
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
                  label="Correct Answer"
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
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 rounded-lg bg-brand hover:bg-brand/90 disabled:opacity-60 text-sm font-semibold text-white transition-colors"
        >
          {isSubmitting ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  );
}
