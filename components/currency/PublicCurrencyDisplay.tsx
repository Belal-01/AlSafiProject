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

  const [currentPage, setCurrentPage] = useState(0);

  const paginatedCurrencies = useMemo(() => {
    const startIndex = currentPage * 6;
    return visibleCurrencies.slice(startIndex, startIndex + 6);
  }, [visibleCurrencies, currentPage]); 

  useEffect(() => {
    if (visibleCurrencies.length <= 6) {
      setCurrentPage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        const totalPages = Math.ceil(visibleCurrencies.length / 6);
        return (prev + 1) % totalPages;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [visibleCurrencies.length]);

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
    if (!supabase) {
      console.error("Supabase client could not be initialized. Realtime updates disabled.");
      return () => { isMounted = false; };
    }
    const channel = supabase
      .channel("public-currency-display")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "currencies" },
        (payload) => {
          console.log("Realtime currencies payload received:", payload);
          loadPrices();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        (payload) => {
          console.log("Realtime settings payload received:", payload);
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            if (payload.new && payload.new.ticker_text) {
              setTickerText(payload.new.ticker_text);
            } else {
              loadSettings();
            }
          } else {
            loadSettings();
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription Status:", status);
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main dir="rtl" className="min-h-screen overflow-hidden flex flex-col bg-[#eef2f0] text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-l from-[#08422e] via-[#0b6b4a] to-[#08422e] py-5 shadow-lg z-10 border-b-[4px] border-[#0b6b4a]">
        <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-md tracking-wide">
          شركة الصافي للصرافة والحوالات
        </h1>
      </header>

      {/* Main Content: 2 Columns */}
      <div className="flex-1 flex flex-row p-6 gap-6 h-[calc(100vh-160px)]">
        
        {/* Right side Logo Panel (RTL: First child) */}
        <div className="w-[30%] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative overflow-hidden border border-gray-300">
          <img
            src="/assets/images/logo/panel.png"
            alt="Safi Panel"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Left side Grid Panel */}
        <div className="w-[70%] flex flex-col relative">
          <style>{`
            @keyframes fadeInSlide {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fadeInSlide 0.8s ease-out forwards;
            }
          `}</style>
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-[#0b6b4a]">
              جاري تحميل الاسعار...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-red-600">
              {error}
            </div>
          ) : (
            <div key={currentPage} className="grid grid-cols-2 gap-5 h-full auto-rows-fr animate-fade-in">
              {paginatedCurrencies.map((currency) => (
                <article
                  key={currency.id}
                  className="flex flex-col rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-200 bg-white max-h-[320px]"
                >
                  {/* Currency Header */}
                  <div className="bg-[#08422e] text-white text-center py-4 text-3xl xl:text-4xl font-extrabold shadow-sm">
                    {currency.base_currency} / {currency.target_currency}
                  </div>
                  
                  {/* Prices */}
                  <div className="flex flex-1">
                    {/* Buy Section */}
                    <div className="flex-1 bg-[#0b6b4a] flex flex-col text-white border-l border-white/20">
                      <div className="text-center py-3 text-2xl xl:text-3xl font-bold bg-black/15 shadow-inner">
                        سعر الشراء
                      </div>
                      <div className="flex-1 flex items-center justify-center text-6xl xl:text-7xl font-black drop-shadow-md">
                        {currency.buy_price}
                      </div>
                    </div>
                    
                    {/* Sell Section */}
                    <div className="flex-1 bg-white flex flex-col text-[#08422e]">
                      <div className="text-center py-3 text-2xl xl:text-3xl font-bold bg-gray-100 border-b border-gray-200 shadow-inner">
                        سعر المبيع
                      </div>
                      <div className="flex-1 flex items-center justify-center text-6xl xl:text-7xl font-black">
                        {currency.sell_price}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Ticker */}
      <footer className="bg-gradient-to-r from-[#0b6b4a] to-[#08422e] text-white flex items-center text-3xl font-bold shadow-inner h-[80px] border-t-[4px] border-[#08422e]">
        {/* <div className="bg-white text-[#08422e] px-10 h-full flex items-center justify-center z-10 shadow-xl rounded-l-2xl ml-4">
          الأخبار
        </div> */}
        <div className="flex-1 overflow-hidden relative flex items-center h-full">
          <div className="ticker-track whitespace-nowrap flex items-center h-full">
            <span className="inline-block px-12">{tickerText}</span>
            <span className="inline-block px-12">{tickerText}</span>
            <span className="inline-block px-12">{tickerText}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
        // <div className="w-[30%] bg-gradient-to-b from-[#08422e] to-[#0b6b4a] rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-8 relative overflow-hidden border border-gray-300">
        //     <div className="flex flex-col items-center justify-center w-full"></div>
        //       <img
        //           src="/assets/images/logo/logo.png" 
        //           alt="Safi Logo" 
        //           className="w-[60%] 2xl:w-[70%] object-contain drop-shadow-md mb-8"
        //         />
                
        //         <h2 className="text-[100px] 2xl:text-[140px] leading-none font-black text-[#eef2f0] tracking-tight drop-shadow-lg">
        //           الصافي
        //         </h2>
                
        //         <h3 className="text-4xl 2xl:text-6xl font-black text-[#9c7b38] drop-shadow-md mt-6">
        //           للصرافة والحوالات
        //         </h3>

        //         <h4 className="text-3xl 2xl:text-5xl font-extrabold text-[#eef2f0] mt-8 drop-shadow-md">
        //           فرع ريف دمشق ، دوما
        //         </h4>

        //         <p className="text-lg 2xl:text-2xl font-bold text-[#eef2f0] tracking-[0.2em] mt-10 uppercase text-center w-full drop-shadow-sm">
        //           Alsafi for EXCHANGE AND REMITTANCES
        //         </p>
        //     </div>
