export const QUERY_KEYS = {
  subjects: ['subjects'] as const,
  topics: (subjectId: string) => ['topics', subjectId] as const,
  subTopics: (topicIds: string[]) => ['subTopics', ...topicIds] as const,
  tests: ['tests'] as const,
  test: (id: string) => ['test', id] as const,
  questions: (ids: string[]) => ['questions', ...ids] as const,
}
