"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeConfigStore } from "@/lib/store/themeConfigStore";
import { menuItems } from "@/constants/menuData";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import AnimateHeight from "react-animate-height";
import { ChevronDown, X } from "lucide-react";
import clsx from "clsx";

export default function Sidebar() {
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const { isSidebarExpanded, toggleSidebar, direction } = useThemeConfigStore();
  const pathname = usePathname();

  useEffect(() => {
    // Automatically open the menu item that contains the current path
    menuItems.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) => child.path === pathname);
        if (isActive) setCurrentMenu(item.title);
      }
    });
  }, [pathname]);

  const toggleSubMenu = (val: string) => {
    setCurrentMenu((oldVal) => (oldVal === val ? "" : val));
  };

  return (
    <div
      className={clsx(
        "fixed inset-y-0 z-50 flex h-screen w-[260px] flex-col transition-all duration-300",
        direction === "rtl" ? "right-0" : "left-0",
        !isSidebarExpanded && "-translate-x-full lg:translate-x-0 lg:w-[80px]",
        direction === "rtl" && !isSidebarExpanded && "translate-x-full lg:translate-x-0"
      )}
    >
      <div className="h-full bg-white dark:bg-black border-r border-gray-100 dark:border-[#191e3a] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)]">
        <div className="flex h-[60px] items-center justify-between px-4 py-3">
          <Link href="/" className="main-logo flex shrink-0 items-center">
             <div className="font-bold text-xl text-primary">
              <span className={clsx("transition-opacity", !isSidebarExpanded && "md:hidden")}>
                AppLogo
              </span>
              <span className={clsx("hidden transition-opacity", !isSidebarExpanded && "md:block text-center w-full")}>
                AL
              </span>
             </div>
          </Link>

          <button
            type="button"
            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-50 dark:hover:bg-dark-light/10 lg:hidden"
            onClick={() => toggleSidebar()}
          >
            <X className="m-auto h-5 w-5 text-gray-400" />
          </button>
        </div>

        <PerfectScrollbar className="relative h-[calc(100vh-60px)]">
          <ul className="relative space-y-1 p-4 font-semibold text-gray-600 dark:text-gray-400">
            {menuItems.map((item, index) => {
              const isActive = item.children 
                ? item.children.some(child => child.path === pathname)
                : item.path === pathname;

              return (
                <li key={item.title} className="nav-item">
                  {item.children ? (
                    <>
                      <button
                        className={clsx(
                          "flex w-full items-center justify-between rounded-lg p-2.5 transition-colors group",
                          currentMenu === item.title || isActive
                            ? "bg-primary/10 text-primary dark:bg-dark-light/10"
                            : "hover:bg-primary/5 hover:text-primary dark:hover:bg-dark-light/5"
                        )}
                        onClick={() => toggleSubMenu(item.title)}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className={clsx("text-sm", !isSidebarExpanded && "lg:hidden")}>
                            {item.title}
                          </span>
                        </div>
                        <div className={clsx(!isSidebarExpanded && "lg:hidden", currentMenu === item.title ? "rotate-180" : "rotate-0", "transition-transform")}>
                           <ChevronDown className="h-4 w-4" />
                        </div>
                      </button>
                      <AnimateHeight duration={300} height={currentMenu === item.title ? "auto" : 0}>
                        <ul className={clsx("sub-menu space-y-1 py-2", !isSidebarExpanded && "lg:hidden")}>
                          {item.children.map((child) => (
                            <li key={child.title}>
                              <Link
                                href={child.path || "#"}
                                className={clsx(
                                  "flex items-center gap-2 rounded-lg py-2 pl-10 pr-4 text-sm transition-colors",
                                  pathname === child.path
                                    ? "text-primary font-bold"
                                    : "hover:text-primary"
                                )}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()} // Close sidebar on mobile
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </AnimateHeight>
                    </>
                  ) : (
                    <Link
                      href={item.path || "#"}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-lg p-2.5 transition-colors group",
                        isActive
                          ? "bg-primary text-white"
                          : "hover:bg-primary/5 hover:text-primary dark:hover:bg-dark-light/5"
                      )}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar()} // Close sidebar on mobile
                    >
                      {item.icon}
                      <span className={clsx("text-sm", !isSidebarExpanded && "lg:hidden")}>
                        {item.title}
                      </span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </PerfectScrollbar>
      </div>
    </div>
  );
}
