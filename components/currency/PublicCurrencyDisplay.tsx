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
    }, 30000);

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
    <main dir="rtl" className="h-screen w-screen overflow-hidden flex flex-col bg-[#eef2f0] text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-l from-[#08422e] via-[#0b6b4a] to-[#08422e] py-2 sm:py-3 shadow-lg z-10 border-b-[4px] border-[#0b6b4a] shrink-0">
        <h1 className="text-center text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white drop-shadow-md tracking-wide">
          شركة الصافي للصرافة والحوالات
        </h1>
      </header>

      {/* Main Content: 2 Columns */}
      <div className="flex-1 flex flex-col lg:flex-row p-2 sm:p-4 lg:p-4  gap-2 sm:gap-4 lg:gap-6 min-h-0">
        
        {/* Right side Logo Panel (RTL: First child) */}
        <div className="w-full lg:w-[28%] h-[15vh] sm:h-[20vh] lg:h-full rounded-2xl lg:rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative overflow-hidden border border-gray-300 shrink-0">
          <img
            src="/assets/images/logo/panel.png"
            alt="Safi Panel"
            className="w-full h-full object-cover lg:object-fill"
          />
        </div>

        {/* Left side Grid Panel */}
        <div className="w-full lg:w-[72%] flex flex-col relative flex-1 min-h-0">
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
            <div className="flex h-full items-center justify-center text-3xl sm:text-4xl font-bold text-[#0b6b4a]">
              جاري تحميل الاسعار...
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-3xl sm:text-4xl font-bold text-red-600">
              {error}
            </div>
          ) : (
            <div key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 h-full auto-rows-fr animate-fade-in min-h-0">
              {paginatedCurrencies.map((currency) => (
                <article
                  key={currency.id}
                  className="flex flex-col rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-200 bg-white min-h-0 max-h-[25vh]"
                >
                  {/* Currency Header */}
                  <div className="bg-[#08422e] text-white text-center py-1 sm:py-2 text-xl sm:text-2xl 2xl:text-3xl font-extrabold shadow-sm shrink-0">
                    {currency.base_currency} / {currency.target_currency}
                  </div>
                  
                  {/* Prices */}
                  <div className="flex flex-1 min-h-0">
                    {/* Buy Section */}
                    <div className="flex-1 bg-[#0b6b4a] flex flex-col text-white border-l border-white/20 min-h-0">
                      <div className="text-center py-1 sm:py-2 text-xl  2xl:text-3xl  font-bold bg-black/15 shadow-inner shrink-0">
                        سعر الشراء
                      </div>
                      <div className="flex-1 flex items-center justify-center py-1 sm:py-2 lg:py-4 text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl 3xl:text-6xl font-black drop-shadow-md min-h-0 overflow-hidden text-ellipsis whitespace-nowrap">
                        {currency.buy_price}
                      </div>
                    </div>
                    
                    {/* Sell Section */}
                    <div className="flex-1 bg-white flex flex-col text-[#08422e] min-h-0">
                      <div className="text-center py-1 sm:py-2 text-xl  2xl:text-3xl  font-bold bg-gray-100 border-b border-gray-200 shadow-inner shrink-0">
                        سعر المبيع
                      </div>
                      <div className="flex-1 flex items-center justify-center py-1 sm:py-2 lg:py-4 text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl  3xl:text-6xl font-black min-h-0 overflow-hidden text-ellipsis whitespace-nowrap">
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
      <footer className="bg-gradient-to-r from-[#0b6b4a] to-[#08422e] text-white flex items-center text-lg sm:text-2xl font-bold shadow-inner h-[50px] sm:h-[70px] border-t-[4px] border-[#08422e] shrink-0">
        <div className="flex-1 overflow-hidden relative flex items-center h-full">
          <div className="ticker-track whitespace-nowrap flex items-center h-full">
            <span className="inline-block px-8 sm:px-12">{tickerText}</span>
            <span className="inline-block px-8 sm:px-12">{tickerText}</span>
            <span className="inline-block px-8 sm:px-12">{tickerText}</span>
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
