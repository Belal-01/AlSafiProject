import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiAuth } from "@/lib/api/auth";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const changePasswordSchema = z.object({
  new_password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  // 1. Verify the admin is logged in (using our custom token)
  const auth = await requireApiAuth(request);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  // 2. Update the password using Supabase Admin API
  const supabase = createSupabaseServerClient();
  
  // Note: auth.userId is the Supabase User ID that we saved in the custom token during login
  const { error } = await supabase.auth.admin.updateUserById(auth.userId, {
    password: parsed.data.new_password,
  });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ message: "Password updated successfully" });
}
