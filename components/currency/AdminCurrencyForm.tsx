"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import type { Currency } from "@/lib/supabase/types";

type FormState = {
  base_currency: string;
  target_currency: string;
  buy_price: string;
  sell_price: string;
};

const emptyForm: FormState = {
  base_currency: "",
  target_currency: "",
  buy_price: "",
  sell_price: "",
};

export default function AdminCurrencyForm() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCurrency = useMemo(
    () => currencies.find((currency) => currency.id === selectedId),
    [currencies, selectedId]
  );

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const response = await fetch("/api/prices", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "تعذر تحميل العملات");
        }

        const loadedCurrencies = payload.data ?? [];
        setCurrencies(loadedCurrencies);

        if (loadedCurrencies[0]) {
          setSelectedId(loadedCurrencies[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "تعذر تحميل العملات");
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrencies();
  }, []);

  useEffect(() => {
    if (!selectedCurrency) {
      setFormState(emptyForm);
      return;
    }

    setFormState({
      base_currency: selectedCurrency.base_currency,
      target_currency: selectedCurrency.target_currency,
      buy_price: selectedCurrency.buy_price,
      sell_price: selectedCurrency.sell_price,
    });
    setMessage(null);
    setError(null);
  }, [selectedCurrency]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedId) {
      setError("اختر زوج عملات اولا");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/prices/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "تعذر حفظ التعديلات");
      }

      setCurrencies((currentCurrencies) =>
        currentCurrencies.map((currency) =>
          currency.id === selectedId ? { ...currency, ...payload.data } : currency
        )
      );
      setMessage("تم تحديث السعر بنجاح");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ التعديلات");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f4f7f5] px-4 py-6 text-[#10231f]">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-5">
        <div className="rounded-lg bg-[#0b2f26] p-5 text-white shadow-lg">
          <p className="m-0 text-sm font-bold text-white/70">لوحة التحكم</p>
          <h1 className="m-0 mt-1 text-2xl font-extrabold sm:text-3xl">
            شركة الصافي للصرافة والحوالات
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow-lg sm:p-5">
          <div className="mb-5">
            <label className="mb-2 block text-sm font-extrabold text-[#39534c]">
              زوج العملات
            </label>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              disabled={isLoading}
              className="h-12 w-full rounded-md border border-[#cbd8d3] bg-white px-3 text-base font-bold outline-none transition focus:border-[#00664f] focus:ring-2 focus:ring-[#00664f]/20"
            >
              {isLoading ? (
                <option>جاري التحميل...</option>
              ) : (
                currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.base_currency} / {currency.target_currency}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-[#39534c]">
                العملة الاولى
              </span>
              <input
                value={formState.base_currency}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, base_currency: event.target.value }))
                }
                className="h-12 w-full rounded-md border border-[#cbd8d3] px-3 text-lg font-bold outline-none transition focus:border-[#00664f] focus:ring-2 focus:ring-[#00664f]/20"
                placeholder="دولار"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-[#39534c]">
                العملة الثانية
              </span>
              <input
                value={formState.target_currency}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, target_currency: event.target.value }))
                }
                className="h-12 w-full rounded-md border border-[#cbd8d3] px-3 text-lg font-bold outline-none transition focus:border-[#00664f] focus:ring-2 focus:ring-[#00664f]/20"
                placeholder="سوري"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-[#087d47]">
                سعر الشراء
              </span>
              <input
                value={formState.buy_price}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, buy_price: event.target.value }))
                }
                className="h-12 w-full rounded-md border border-[#b8dbc8] px-3 text-lg font-black text-[#087d47] outline-none transition focus:border-[#00a650] focus:ring-2 focus:ring-[#00a650]/20"
                inputMode="decimal"
                placeholder="14500"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-extrabold text-[#b21f2d]">
                سعر المبيع
              </span>
              <input
                value={formState.sell_price}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, sell_price: event.target.value }))
                }
                className="h-12 w-full rounded-md border border-[#ecc1c6] px-3 text-lg font-black text-[#b21f2d] outline-none transition focus:border-[#d92735] focus:ring-2 focus:ring-[#d92735]/20"
                inputMode="decimal"
                placeholder="14600"
                required
              />
            </label>
          </div>

          {message && (
            <p className="mt-4 rounded-md bg-[#e6f6ed] px-3 py-2 text-sm font-bold text-[#087d47]">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-md bg-[#fff0f1] px-3 py-2 text-sm font-bold text-[#b21f2d]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving || isLoading || currencies.length === 0}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#00664f] text-base font-extrabold text-white shadow-lg shadow-[#00664f]/20 transition hover:bg-[#075543] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "جاري الحفظ..." : "حفظ التحديث"}
          </button>
        </form>
      </section>
    </main>
  );
}
