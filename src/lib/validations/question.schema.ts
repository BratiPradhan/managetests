import { z } from "zod";

export const questionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  option1: z.string().min(1, "Option 1 is required"),
  option2: z.string().min(1, "Option 2 is required"),
  option3: z.string().min(1, "Option 3 is required"),
  option4: z.string().min(1, "Option 4 is required"),
  correct_option: z.enum(["option1", "option2", "option3", "option4"], {
    message: "Select the correct option",
  }),
  explanation: z.string().optional(),
  difficulty: z.string().optional(),
  media_url: z.string().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
