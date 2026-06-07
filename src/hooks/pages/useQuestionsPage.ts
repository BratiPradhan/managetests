import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getTestById, updateTest } from "@/services/test.service";
import {
  bulkCreateQuestions,
  fetchBulkQuestions,
} from "@/services/question.service";
import { useTestFlowStore } from "@/store/testFlow.store";
import { queryClient } from "@/lib/query-client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Question } from "@/types";
import { QuestionFormValues } from "@/lib/validations/question.schema";

export function useQuestionsPage(id: string) {
  const router = useRouter();
  const {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    setQuestions,
    setTestId,
  } = useTestFlowStore();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);

  const { data: test = null, isLoading: testLoading } = useQuery({
    queryKey: QUERY_KEYS.test(id),
    queryFn: async () => {
      setTestId(id);
      const data = await getTestById(id);
      // Load existing questions into Zustand if not already loaded
      if (data.questions?.length && questions.length === 0) {
        const existing = await fetchBulkQuestions(data.questions);
        setQuestions(existing);
      }
      return data;
    },
    enabled: !!id,
  });

  const resetForm = () => setFormKey((k) => k + 1);

  const handleAdd = useCallback(
    (values: QuestionFormValues) => {
      const q: Question = {
        ...values,
        type: "mcq",
        test_id: id,
        subject: test?.subject,
      };
      addQuestion(q);
      resetForm();
    },
    [addQuestion, id, test?.subject],
  );

  const handleUpdate = useCallback(
    (values: QuestionFormValues) => {
      if (editingIndex === null) return;
      const existing = questions[editingIndex];
      updateQuestion(editingIndex, {
        ...existing,
        ...values,
        type: "mcq",
        test_id: id,
        subject: test?.subject,
      });
      setEditingIndex(null);
      resetForm();
    },
    [editingIndex, questions, updateQuestion, id, test?.subject],
  );

  const handleDelete = useCallback(
    (index: number) => {
      removeQuestion(index);
      if (editingIndex === index) {
        setEditingIndex(null);
        resetForm();
      }
    },
    [removeQuestion, editingIndex],
  );

  const handleEdit = useCallback((index: number) => setEditingIndex(index), []);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    resetForm();
  }, []);

  const { mutateAsync: saveQuestions } = useMutation({
    mutationFn: async () => {
      const newQs = questions.filter((q) => !q.id);
      const existingIds = questions.filter((q) => q.id).map((q) => q.id!);
      let newIds: string[] = [];
      if (newQs.length > 0) {
        const created = await bulkCreateQuestions(
          newQs.map(({ id: _id, ...rest }) => rest),
        );
        newIds = created.map((q) => q.id!);
      }
      const allIds = [...existingIds, ...newIds];
      await updateTest(id, {
        questions: allIds,
        total_questions: allIds.length,
      });
      return allIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.test(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.questions([]) });
      router.push(`/tests/${id}/preview`);
    },
    onError: () => setError("Failed to save questions. Please try again."),
  });

  const handleSaveAndContinue = useCallback(async () => {
    if (questions.length === 0) {
      setError("Add at least one question before continuing.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveQuestions();
    } finally {
      setSaving(false);
    }
  }, [questions, saveQuestions]);

  const handleExit = useCallback(() => router.push("/dashboard"), [router]);

  const editingQuestion =
    editingIndex !== null ? questions[editingIndex] : null;
  const formDefaultValues = useMemo<
    Partial<QuestionFormValues> | undefined
  >(() => {
    if (!editingQuestion) return undefined;
    return {
      question: editingQuestion.question,
      option1: editingQuestion.option1,
      option2: editingQuestion.option2,
      option3: editingQuestion.option3,
      option4: editingQuestion.option4,
      correct_option:
        editingQuestion.correct_option as QuestionFormValues["correct_option"],
      explanation: editingQuestion.explanation ?? "",
      difficulty: editingQuestion.difficulty ?? "",
      topic: editingQuestion.topic ?? "",
      sub_topic: editingQuestion.sub_topic ?? "",
      media_url: editingQuestion.media_url ?? "",
    };
  }, [editingQuestion]);

  return {
    test,
    loading: testLoading,
    saving,
    error,
    questions,
    editingIndex,
    formKey,
    formDefaultValues,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleSaveAndContinue,
    handleExit,
  };
}
