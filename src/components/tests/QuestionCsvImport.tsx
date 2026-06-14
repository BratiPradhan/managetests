"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, Download, FileUp, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuestionFormValues } from "@/lib/validations/question.schema";
import {
  buildQuestionCsvTemplate,
  parseQuestionsCsv,
  ParsedQuestionRow,
} from "@/lib/questionCsv";

interface NamedOption {
  id: string;
  name: string;
}

interface QuestionCsvImportProps {
  topicOptions: NamedOption[];
  subTopicOptions: NamedOption[];
  onImport: (questions: QuestionFormValues[]) => void;
}

export default function QuestionCsvImport({
  topicOptions,
  subTopicOptions,
  onImport,
}: QuestionCsvImportProps) {
  const [rows, setRows] = useState<ParsedQuestionRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = useCallback(() => {
    const csv = buildQuestionCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "questions-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      setParsing(true);
      try {
        const parsed = await parseQuestionsCsv(file, topicOptions, subTopicOptions);
        setRows(parsed);
      } finally {
        setParsing(false);
      }
    },
    [topicOptions, subTopicOptions],
  );

  const validRows = rows.filter((r) => r.data !== null);

  const handleImport = useCallback(() => {
    onImport(validRows.map((r) => r.data!));
    setRows([]);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [validRows, onImport]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadTemplate}
          className="gap-1.5"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </Button>

        <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand/40 text-brand text-sm font-medium py-2 cursor-pointer hover:bg-brand/5 transition-colors">
          <FileUp className="w-3.5 h-3.5" />
          {fileName ?? "Choose CSV file"}
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {parsing && <p className="text-sm text-gray-400">Parsing file...</p>}

      {rows.length > 0 && !parsing && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{validRows.length}</span> of{" "}
            {rows.length} rows ready to import
          </p>

          <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {rows.map((r) => (
              <li
                key={r.row}
                className="flex items-start gap-2 text-sm border border-gray-100 rounded-lg px-3 py-2"
              >
                {r.data ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-gray-700 truncate">
                    Row {r.row}: {r.data?.question || "—"}
                  </p>
                  {(r.errors.length > 0 || r.warnings.length > 0) && (
                    <p
                      className={cn(
                        "text-xs",
                        r.errors.length > 0 ? "text-red-400" : "text-amber-500",
                      )}
                    >
                      {[...r.errors, ...r.warnings].join("; ")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Button type="button" onClick={handleImport} disabled={validRows.length === 0}>
            Import {validRows.length} Question{validRows.length === 1 ? "" : "s"}
          </Button>
        </div>
      )}
    </div>
  );
}
