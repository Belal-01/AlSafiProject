"use client";
import React, { useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useThemeConfigStore } from "@/lib/store/themeConfigStore";
import clsx from "clsx";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarExpanded, themeMode, direction } = useThemeConfigStore();

  useEffect(() => {
    // This effect runs after the initial render (hydration)
    // We just want to ensure we don't block the initial render.
  }, []);

  // Update the HTML root class for Tailwind Dark Mode
  useEffect(() => {
    const isDark =
      themeMode === "dark" ||
      (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeMode]);

  return (
    <div
      className={clsx(
        "relative min-h-screen text-black dark:text-white-dark bg-[#fafafa] dark:bg-[#060818]",
        themeMode === "dark" || (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
          ? "dark"
          : ""
      )}
      dir={direction}
    >
      {/* Background Overlay for Mobile Sidebar */}
      <div 
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          isSidebarExpanded ? "opacity-100 block" : "opacity-0 hidden"
        )}
      />

      <Sidebar />

      <div
        className={clsx(
          "main-content flex min-h-screen flex-col transition-all duration-300",
          direction === "rtl"
            ? isSidebarExpanded ? "lg:mr-[260px]" : "lg:mr-[80px]"
            : isSidebarExpanded ? "lg:ml-[260px]" : "lg:ml-[80px]"
        )}
      >
        <Header />
        
        {/* Main Content Area */}
        <div className="grow p-6 animate__animated animate__fadeIn">
          {children}
        </div>

        <Footer />
      </div>
    </div>
  );
}
