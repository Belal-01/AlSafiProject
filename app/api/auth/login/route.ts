import { NextRequest } from "next/server";
import { z } from "zod";
import { createApiToken } from "@/lib/api/auth";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid credentials" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return jsonResponse({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createApiToken({
    userId: data.user.id,
    role: "admin",
  });

  return jsonResponse({
    token,
    token_type: "Bearer",
    expires_in: 60 * 60 * 24 * 7,
  });
}
