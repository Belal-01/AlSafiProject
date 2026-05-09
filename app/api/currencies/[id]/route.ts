import { NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/api/auth";
import { currencySelect, normalizeCurrencyPayload, updateCurrencySchema } from "@/lib/api/currencies";
import { jsonResponse, optionsResponse } from "@/lib/api/cors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("currencies")
    .select(currencySelect)
    .eq("id", id)
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 404 });
  }

  return jsonResponse({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateCurrencySchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { error: parsed.error.issues[0]?.message ?? "Invalid request body" },
      { status: 400 }
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonResponse({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("currencies")
    .update(normalizeCurrencyPayload(parsed.data))
    .eq("id", id)
    .select(currencySelect)
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAuth(request);

  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("currencies")
    .delete()
    .eq("id", id)
    .select(currencySelect)
    .single();

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ data });
}
