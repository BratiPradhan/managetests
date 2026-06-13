import { z } from 'zod'

export const testSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  type: z.string().min(1, 'Test type is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  difficulty: z.string().min(1, 'Difficulty is required'),
  correct_marks: z.number(),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number().min(1, 'Duration is required'),
  total_marks: z.number().min(1, 'Total marks is required'),
  total_questions: z.number().min(1, 'No of questions is required'),
})

export type TestFormValues = z.infer<typeof testSchema>
