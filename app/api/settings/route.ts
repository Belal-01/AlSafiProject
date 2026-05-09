import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireApiAuth } from "@/lib/api/auth";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("settings")
    .select("ticker_text")
    .limit(1)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({
    data: data ?? { ticker_text: "" },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ticker_text } = await request.json();

    if (typeof ticker_text !== "string") {
      return jsonResponse({ error: "Invalid ticker_text" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("settings")
        .update({ ticker_text })
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("settings")
        .insert([{ ticker_text }]);

      if (error) throw error;
    }

    return jsonResponse({ success: true, message: "Ticker updated successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update ticker";
    return jsonResponse({ error: message }, { status: 500 });
  }
}
