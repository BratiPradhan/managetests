"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuestionsPage } from "@/hooks/pages/useQuestionsPage";
import QuestionForm from "@/components/tests/QuestionForm";
import QuestionCsvImport from "@/components/tests/QuestionCsvImport";
import QuestionSidebar from "@/components/tests/QuestionSidebar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Clock,
  FileText,
  Gauge,
  Pencil,
  Plus,
  Upload,
} from "lucide-react";

export default function QuestionsPage() {
  const { id } = useParams<{ id: string }>();
  const {
    test,
    loading,
    saving,
    error,
    questions,
    editingIndex,
    formKey,
    formDefaultValues,
    topicOptions,
    subTopicOptions,
    mode,
    switchMode,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleCancelEdit,
    handleImportQuestions,
    handleSaveAndContinue,
    handleExit,
  } = useQuestionsPage(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error ?? "Test not found."}
      </div>
    );
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
      {/* ── Left drawer — added questions ─────────────────────── */}
      <div className="hidden md:block shrink-0 self-start">
        <QuestionSidebar
          questions={questions}
          totalQuestions={test.total_questions}
          currentIndex={editingIndex}
          onSelect={handleEdit}
          onAddQuestion={handleCancelEdit}
        />
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Test info card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full capitalize">
              {test.type?.replace("_", " ") || "Chapter Wise"}
            </span>
            <Link
              href={`/tests/${test.id}/edit`}
              className="text-brand hover:text-brand/80 transition-colors"
              aria-label="Edit test"
            >
              <Pencil className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen className="w-5 h-5 text-brand" />
            <span className="font-semibold text-gray-800">{test.name}</span>
            <Badge className="capitalize bg-emerald-500 text-white gap-1">
              <Gauge className="w-3 h-3" />
              {test.difficulty}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 w-20 shrink-0">Subject</span>
              <span className="text-gray-400">:</span>
              <span className="font-medium text-gray-700">{test.subject}</span>
            </div>

            {test.topics.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-400 w-20 shrink-0 pt-0.5">Topic</span>
                <span className="text-gray-400 pt-0.5">:</span>
                <div className="flex flex-wrap gap-1.5">
                  {test.topics.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="rounded-full text-amber-600 border-amber-300 bg-amber-50"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 flex-wrap">
              {test.sub_topics.length > 0 ? (
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 w-20 shrink-0 pt-0.5">Sub Topic</span>
                  <span className="text-gray-400 pt-0.5">:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {test.sub_topics.map((subTopic) => (
                      <Badge
                        key={subTopic}
                        variant="outline"
                        className="rounded-full text-amber-600 border-amber-300 bg-amber-50"
                      >
                        {subTopic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <span />
              )}

              <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {test.total_time} Min
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> {test.total_questions} Q&apos;s
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5" /> {test.total_marks} Marks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Question form card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">
              {mode === "csv"
                ? "Bulk Import via CSV"
                : editingIndex !== null
                  ? `Editing Question ${editingIndex + 1}`
                  : `Add Question ${questions.length + 1}`}
            </h2>
            <div className="flex items-center gap-2">
              {editingIndex !== null && mode === "manual" && (
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Cancel Edit
                </button>
              )}
              <button
                onClick={() => switchMode("manual")}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                  mode === "manual"
                    ? "border-brand text-brand bg-brand/5"
                    : "border-gray-200 text-gray-400 hover:text-gray-600",
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                MCQ
              </button>
              <button
                onClick={() => switchMode("csv")}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                  mode === "csv"
                    ? "border-brand text-brand bg-brand/5"
                    : "border-gray-200 text-gray-400 hover:text-gray-600",
                )}
              >
                <Upload className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>
          </div>

          {mode === "csv" ? (
            <QuestionCsvImport
              topicOptions={topicOptions}
              subTopicOptions={subTopicOptions}
              onImport={handleImportQuestions}
            />
          ) : (
            <QuestionForm
              key={formKey}
              defaultValues={formDefaultValues}
              topicOptions={topicOptions}
              subTopicOptions={subTopicOptions}
              isEditing={editingIndex !== null}
              onSubmit={editingIndex !== null ? handleUpdate : handleAdd}
              onCancel={editingIndex !== null ? handleCancelEdit : undefined}
            />
          )}
        </div>

        {/* Mobile question list */}
        {questions.length > 0 && (
          <div className="md:hidden bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Added Questions ({questions.length})
            </p>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={q.id ?? i} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="flex-1 text-gray-700 truncate">
                    Q{i + 1}: {q.question}
                  </span>
                  <button
                    onClick={() => handleEdit(i)}
                    className="text-blue-500 hover:text-blue-700 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(i)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error + footer */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center justify-between pt-2 pb-4">
          <button
            onClick={handleExit}
            className="px-5 py-2.5 rounded-lg bg-red-400 hover:bg-red-500 text-sm font-semibold text-white transition-colors"
          >
            Exit Test Creation
          </button>
          <button
            onClick={handleSaveAndContinue}
            disabled={saving || questions.length === 0}
            className="px-8 py-2.5 rounded-lg bg-brand hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
