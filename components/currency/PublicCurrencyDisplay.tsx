"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Currency } from "@/lib/supabase/types";

const fallbackTicker =
  "شركة الصافي للصرافة والحوالات ترحب بكم - يتم تحديث الاسعار بشكل مباشر";

export default function PublicCurrencyDisplay() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [tickerText, setTickerText] = useState(fallbackTicker);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const visibleCurrencies = useMemo(
    () =>
      currencies
        .filter((currency) => currency.is_visible)
        .sort((a, b) => a.sort_order - b.sort_order),
    [currencies]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadPrices() {
      try {
        const response = await fetch("/api/prices", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "تعذر تحميل الاسعار");
        }

        if (isMounted) {
          setCurrencies(payload.data ?? []);
          setError(null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "تعذر تحميل الاسعار");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPrices();

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = await response.json();

        if (response.ok && payload.data?.ticker_text) {
          setTickerText(payload.data.ticker_text);
        }
      } catch {
        setTickerText(fallbackTicker);
      }
    }

    loadSettings();

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      ?.channel("public-currency-display")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "currencies" },
        () => {
          loadPrices();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase?.removeChannel(channel);
      }
    };
  }, []);

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-[#07120f] text-white">
      <section className="flex min-h-screen flex-col">
        <header className="border-b border-white/10 bg-[#0b2f26] px-6 py-5 text-center shadow-2xl">
          <h1 className="m-0 text-3xl font-extrabold tracking-normal text-white sm:text-5xl lg:text-6xl">
            شركة الصافي للصرافة والحوالات
          </h1>
        </header>

        <div className="grid grid-cols-3 bg-[#123d32] text-center text-xl font-black sm:text-3xl">
          <div className="border-l border-white/20 py-4">العملة</div>
          <div className="border-l border-white/20 bg-[#088449] py-4">شراء</div>
          <div className="bg-[#b21f2d] py-4">مبيع</div>
        </div>

        <div className="flex-1 p-3 sm:p-5 lg:p-8">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-3xl font-bold">
              جاري تحميل الاسعار...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-center text-2xl font-bold text-red-200">
              {error}
            </div>
          ) : (
            <div className="grid auto-rows-fr gap-3 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {visibleCurrencies.map((currency) => (
                <article
                  key={currency.id}
                  className="grid min-h-[140px] grid-cols-3 overflow-hidden rounded-lg border border-white/15 bg-white shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="flex items-center justify-center bg-[#f6f3e8] p-3 text-center text-2xl font-black leading-tight text-[#09271f] sm:text-4xl">
                    {currency.base_currency} / {currency.target_currency}
                  </div>
                  <div className="flex items-center justify-center bg-[#00a650] p-3 text-center text-3xl font-black text-white sm:text-5xl">
                    {currency.buy_price}
                  </div>
                  <div className="flex items-center justify-center bg-[#d92735] p-3 text-center text-3xl font-black text-white sm:text-5xl">
                    {currency.sell_price}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-white/10 bg-[#d92735] py-4 text-2xl font-extrabold text-white sm:text-3xl">
          <div className="ticker-track whitespace-nowrap">
            <span className="inline-block px-12">{tickerText}</span>
            <span className="inline-block px-12">{tickerText}</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
