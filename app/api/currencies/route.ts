import { NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/api/auth";
import { currencySelect, createCurrencySchema, normalizeCurrencyPayload } from "@/lib/api/currencies";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const onlyVisible = request.nextUrl.searchParams.get("visible");
  let query = supabase
    .from("currencies")
    .select(currencySelect)
    .order("sort_order", { ascending: true });

  if (onlyVisible === "true") {
    query = query.eq("is_visible", true);
  }

  const { data, error } = await query;

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ data });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth(request);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCurrencySchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("currencies")
    .insert(normalizeCurrencyPayload(parsed.data))
    .select(currencySelect)
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ data }, { status: 201 });
}
