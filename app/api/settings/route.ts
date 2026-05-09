import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
