import Papa from "papaparse";
import { questionSchema, QuestionFormValues } from "@/lib/validations/question.schema";
import { resolveName } from "@/lib/resolveNames";
import { DIFFICULTIES } from "@/lib/constants";

const QUESTION_CSV_HEADERS = [
  "question",
  "option1",
  "option2",
  "option3",
  "option4",
  "correct_option",
  "explanation",
  "difficulty",
  "topic",
  "sub_topic",
  "media_url",
] as const;

export function buildQuestionCsvTemplate(): string {
  return Papa.unparse({
    fields: [...QUESTION_CSV_HEADERS],
    data: [
      [
        "What is 2 + 2?",
        "3",
        "4",
        "5",
        "6",
        "option2",
        "Basic addition",
        "easy",
        "",
        "",
        "",
      ],
      [
        "What is the capital of France?",
        "Berlin",
        "Madrid",
        "Paris",
        "Rome",
        "option3",
        "Paris is the capital of France",
        "easy",
        "",
        "",
        "",
      ],
      [
        "Which planet is known as the Red Planet?",
        "Earth",
        "Venus",
        "Mars",
        "Jupiter",
        "option3",
        "Mars appears red due to iron oxide on its surface",
        "medium",
        "",
        "",
        "",
      ],
    ],
  });
}

export interface ParsedQuestionRow {
  /** 1-based row number, matching the spreadsheet row including the header. */
  row: number;
  /** Validated form values, or null if the row has blocking errors. */
  data: QuestionFormValues | null;
  /** Blocking issues — row is excluded from import. */
  errors: string[];
  /** Non-blocking issues — field was left blank but row is still imported. */
  warnings: string[];
}

const CORRECT_OPTION_MAP: Record<string, QuestionFormValues["correct_option"]> = {
  "1": "option1",
  "2": "option2",
  "3": "option3",
  "4": "option4",
  a: "option1",
  b: "option2",
  c: "option3",
  d: "option4",
  option1: "option1",
  option2: "option2",
  option3: "option3",
  option4: "option4",
};

interface NamedEntity {
  id: string;
  name: string;
}

export function parseQuestionsCsv(
  file: File,
  topicOptions: NamedEntity[],
  subTopicOptions: NamedEntity[],
): Promise<ParsedQuestionRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) =>
        resolve(
          results.data.map((raw, index) =>
            parseRow(raw, index, topicOptions, subTopicOptions),
          ),
        ),
      error: reject,
    });
  });
}

function parseRow(
  raw: Record<string, string>,
  index: number,
  topicOptions: NamedEntity[],
  subTopicOptions: NamedEntity[],
): ParsedQuestionRow {
  const warnings: string[] = [];
  const get = (key: string) => (raw[key] ?? "").trim();

  const correct_option = CORRECT_OPTION_MAP[get("correct_option").toLowerCase()];

  const difficultyRaw = get("difficulty").toLowerCase();
  let difficulty = "";
  if (difficultyRaw) {
    if ((DIFFICULTIES as readonly string[]).includes(difficultyRaw)) {
      difficulty = difficultyRaw;
    } else {
      warnings.push(`Unrecognized difficulty "${get("difficulty")}" — left blank`);
    }
  }

  let topic = "";
  const topicRaw = get("topic");
  if (topicRaw) {
    const match = resolveName(topicRaw, topicOptions);
    if (match) {
      topic = match.id;
    } else {
      warnings.push(`Unrecognized topic "${topicRaw}" — left blank`);
    }
  }

  let sub_topic = "";
  const subTopicRaw = get("sub_topic");
  if (subTopicRaw) {
    const match = resolveName(subTopicRaw, subTopicOptions);
    if (match) {
      sub_topic = match.id;
    } else {
      warnings.push(`Unrecognized sub-topic "${subTopicRaw}" — left blank`);
    }
  }

  const candidate = {
    question: get("question"),
    option1: get("option1"),
    option2: get("option2"),
    option3: get("option3"),
    option4: get("option4"),
    correct_option: correct_option as QuestionFormValues["correct_option"],
    explanation: get("explanation"),
    difficulty,
    topic,
    sub_topic,
    media_url: get("media_url"),
  };

  const result = questionSchema.safeParse(candidate);

  return {
    row: index + 2,
    data: result.success ? result.data : null,
    errors: result.success ? [] : result.error.issues.map((issue) => issue.message),
    warnings,
  };
}
