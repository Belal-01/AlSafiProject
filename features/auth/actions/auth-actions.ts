"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/features/auth/types";
import { createSession, deleteSession } from "@/lib/auth";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { email: valEmail, password: valPassword } = validatedFields.data;

  // Mock a database check (e.g., admin@example.com / password123)
  if (valEmail === "admin@example.com" && valPassword === "password123") {
    // Create a session cookie
    await createSession("user_12345");
  } else {
    // Return serializable error objects
    return { error: "Invalid email or password" };
  }

  // Redirect to /dashboard
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
