"use client";
import React from "react";
import { useThemeConfigStore } from "@/lib/store/themeConfigStore";
import { Menu, Search, Sun, Moon, Monitor, Bell } from "lucide-react";
import clsx from "clsx";
import Dropdown from "../Dropdown";
import Link from "next/link";

export default function Header() {
  const { toggleSidebar, themeMode, setTheme } = useThemeConfigStore();

  return (
    <header className="z-40 w-full bg-white dark:bg-black border-b border-gray-100 dark:border-[#191e3a] shadow-sm sticky top-0">
      <div className="flex px-4 py-2.5 items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50/50 hover:bg-gray-100 dark:bg-dark-light/10 dark:hover:bg-dark-light/20 transition-colors"
            onClick={() => toggleSidebar()}
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="hidden sm:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 border border-solid border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-dark focus:outline-none focus:ring-1 focus:ring-primary w-64 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
            
          {/* Theme Toggle Dropdown */}
          <div className="dropdown shrink-0">
             <Dropdown
                offset={[0, 8]}
                placement="bottom-end"
                btnClassName="relative block p-2 rounded-full bg-gray-50/50 hover:bg-gray-100 dark:bg-dark-light/10 dark:hover:bg-dark-light/20"
                button={
                  themeMode === 'light' ? <Sun className="h-5 w-5" /> :
                  themeMode === 'dark' ? <Moon className="h-5 w-5" /> :
                  <Monitor className="h-5 w-5" />
                }
             >
                <ul className="text-dark dark:text-white-dark py-0! w-[170px] font-semibold">
                    <li>
                        <button type="button" className={clsx("flex w-full items-center gap-3 p-2 hover:text-primary", themeMode === 'light' && "text-primary bg-primary/10")} onClick={() => setTheme('light')}>
                            <Sun className="h-4 w-4 shrink-0" />
                            Light
                        </button>
                    </li>
                    <li>
                        <button type="button" className={clsx("flex w-full items-center gap-3 p-2 hover:text-primary", themeMode === 'dark' && "text-primary bg-primary/10")} onClick={() => setTheme('dark')}>
                            <Moon className="h-4 w-4 shrink-0" />
                            Dark
                        </button>
                    </li>
                    <li>
                        <button type="button" className={clsx("flex w-full items-center gap-3 p-2 hover:text-primary", themeMode === 'system' && "text-primary bg-primary/10")} onClick={() => setTheme('system')}>
                            <Monitor className="h-4 w-4 shrink-0" />
                            System
                        </button>
                    </li>
                </ul>
             </Dropdown>
          </div>

          {/* Notifications Placeholder */}
          <button className="relative block p-2 rounded-full bg-gray-50/50 hover:bg-gray-100 dark:bg-dark-light/10 dark:hover:bg-dark-light/20">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger"></span>
          </button>

          {/* User Profile Dropdown Placeholder */}
          <div className="dropdown shrink-0">
             <Dropdown
                 offset={[0, 8]}
                 placement="bottom-end"
                 btnClassName="relative group block"
                 button={<img className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/auth/login.svg" alt="userProfile" />}
             >
                 <ul className="text-dark dark:text-white-dark py-0! w-[230px] font-semibold">
                    <li>
                        <div className="flex items-center px-4 py-4">
                            <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/auth/login.svg" alt="userProfile" />
                            <div className="truncate pl-4 dark:text-white">
                                <h4 className="text-base">John Doe</h4>
                                <span className="rounded bg-success-light px-1 text-xs text-success dark:bg-success-dark-light">Admin</span>
                            </div>
                        </div>
                    </li>
                    <li>
                        <Link href="/profile" className="p-3 dark:hover:text-white hover:text-primary flex items-center gap-2">
                           Profile
                        </Link>
                    </li>
                    <li className="border-t border-white-light dark:border-white-light/10">
                        <Link href="/login" className="p-3 py-3! text-danger flex items-center gap-2">
                            Sign Out
                        </Link>
                    </li>
                 </ul>
             </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
