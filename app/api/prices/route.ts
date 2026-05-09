import { currencySelect } from "@/lib/api/currencies";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("currencies")
    .select(currencySelect)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ data });
}
