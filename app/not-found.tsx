'use client';

import { useThemeConfigStore } from '@/lib/store/themeConfigStore';

import Link from 'next/link';
import { useEffect } from 'react';



export default function Error404() {
      const themeMode = useThemeConfigStore((state) => state.themeMode);
      
      useEffect(() => {
          document.title = 'Error 404';
      }, []);
  
      const isDark = themeMode === 'dark';
    return( 
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-[#060818]">
            {/* The gradient bubble */}
            <div className="px-6 py-16 text-center font-semibold before:container before:absolute before:left-1/2 before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#4361EE_0%,rgba(67,97,238,0)_50.73%)] before:aspect-square before:opacity-10 md:py-20">
                <div className="relative z-10">
                    <img
                        src={isDark ? '/assets/images/error/404-dark.svg' : '/assets/images/error/404-light.svg'}
                        alt="404"
                        className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
                    />
                    <p className="mt-5 text-base text-gray-800 dark:text-white">The page you requested was not found!</p>
                    <Link
                        href="/" 
                        className="btn btn-gradient block mx-auto mt-7! w-max border-0 uppercase shadow-none px-6 py-2.5 rounded-md text-white font-bold tracking-wide transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(to right, #4361EE, #805dca)' }}
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>)
}

