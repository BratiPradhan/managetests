"use client";

import { useParams } from "next/navigation";
import { useQuestionsPage } from "@/hooks/pages/useQuestionsPage";
import QuestionForm from "@/components/tests/QuestionForm";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil } from "lucide-react";

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
    handleAdd,
    handleUpdate,
    handleDelete,
    handleEdit,
    handleCancelEdit,
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
      <aside className="w-56 shrink-0 hidden md:flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Question Creation
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Total:{" "}
            <span className="font-semibold text-gray-800">
              {questions.length}
            </span>
          </p>

          {questions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No questions yet
            </p>
          ) : (
            <ul className="space-y-1.5">
              {questions.map((q, i) => (
                <li
                  key={i}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                    editingIndex === i ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleEdit(i)}
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    Q{i + 1}: {q.question.slice(0, 24)}
                    {q.question.length > 24 ? "…" : ""}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(i);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    aria-label="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">
        {/* Test info card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full capitalize">
              {test.type?.replace("_", " ") || "Chapter Wise"}
            </span>
            <span className="font-semibold text-gray-800">{test.name}</span>
            <Badge
              variant="secondary"
              className="capitalize text-green-700 bg-green-50 border-green-200 text-xs"
            >
              {test.difficulty}
            </Badge>
            <div className="ml-auto flex items-center gap-4 text-xs text-gray-400">
              <span>⏱ {test.total_time} Min</span>
              <span>📝 {test.total_questions} Q&apos;s</span>
              <span>📊 {test.total_marks} Marks</span>
            </div>
          </div>
        </div>

        {/* Question form card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex-1">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">
              {editingIndex !== null
                ? `Editing Question ${editingIndex + 1}`
                : `Add Question ${questions.length + 1}`}
            </h2>
            {editingIndex !== null && (
              <button
                onClick={handleCancelEdit}
                className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                Cancel Edit
              </button>
            )}
          </div>

          <QuestionForm
            key={formKey}
            defaultValues={formDefaultValues}
            isEditing={editingIndex !== null}
            onSubmit={editingIndex !== null ? handleUpdate : handleAdd}
            onCancel={editingIndex !== null ? handleCancelEdit : undefined}
          />
        </div>

        {/* Mobile question list */}
        {questions.length > 0 && (
          <div className="md:hidden bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              Added Questions ({questions.length})
            </p>
            <ul className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
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
            className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-white transition-colors"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
