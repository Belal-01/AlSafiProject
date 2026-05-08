import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface SessionPayload {
  userId: string;
  expiresAt: string;
}
