export const PAGE_SIZE = 10;

export const TEST_TYPES = ["chapterwise", "pyq", "mock"] as const;
export type TestType = (typeof TEST_TYPES)[number];
export const TEST_TYPE_LABELS: Record<TestType, string> = {
  chapterwise: "Chapter Wise",
  pyq: "PYQ",
  mock: "Mock Test",
};

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const CORRECT_OPTIONS = ["option1", "option2", "option3", "option4"] as const;
export type CorrectOption = (typeof CORRECT_OPTIONS)[number];
export const CORRECT_OPTION_LABELS: Record<CorrectOption, string> = {
  option1: "Option 1",
  option2: "Option 2",
  option3: "Option 3",
  option4: "Option 4",
};

export const QUESTION_TYPES = ["mcq"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
