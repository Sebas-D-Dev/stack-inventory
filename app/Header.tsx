"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark" | "system";

export default function Header() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<Theme>("system");
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if current path is login or register page
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Update theme when component mounts and when theme changes
  useEffect(() => {
    // Get stored theme or default to system
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme("system");
    }

    // Add event listener for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply the selected theme
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const isDark = 
      newTheme === "dark" || 
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    localStorage.setItem("theme", newTheme);
  };

  // Handle theme change
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <header className="w-full py-4 px-8 border-b transition-colors" style={{
      backgroundColor: 'var(--header-background)',
      borderColor: 'var(--header-border)'
    }}>
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>
          Superblog
        </Link>
        <div className="flex items-center space-x-4">
          {/* Theme Switcher - Always visible */}
          <div className="relative">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--card-background)',
                color: 'var(--text-primary)',
                borderColor: 'var(--card-border)',
                border: '1px solid'
              }}
              aria-label="Change theme"
            >
              {theme === "light" && <SunIcon className="h-5 w-5" />}
              {theme === "dark" && <MoonIcon className="h-5 w-5" />}
              {theme === "system" && <ComputerDesktopIcon className="h-5 w-5" />}
            </button>
            
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 border transition-colors" style={{
                backgroundColor: 'var(--dropdown-background)',
                borderColor: 'var(--dropdown-border)'
              }}>
                <button
                  onClick={() => changeTheme("light")}
                  className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <SunIcon className="h-5 w-5 mr-2" />
                  Light
                </button>
                <button
                  onClick={() => changeTheme("dark")}
                  className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <MoonIcon className="h-5 w-5 mr-2" />
                  Dark
                </button>
                <button
                  onClick={() => changeTheme("system")}
                  className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors hover:bg-opacity-10"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ComputerDesktopIcon className="h-5 w-5 mr-2" />
                  System
                </button>
              </div>
            )}
          </div>
          
          {/* Navigation links - Only shown when not on auth pages or when signed in */}
          {(!isAuthPage || session) && (
            <>
              <Link 
                href="/posts" 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--button-background)',
                  color: 'var(--button-foreground)'
                }}
              >
                Posts
              </Link>
              <Link 
                href="/dashboard" 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--button-background)',
                  color: 'var(--button-foreground)'
                }}
              >
                Dashboard
              </Link>
            </>
          )}

          {/* Authenticated user section */}
          {session ? (
            <>
              <Link 
                href="/posts/new" 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--button-background)',
                  color: 'var(--button-foreground)'
                }}
              >
                New Post
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--button-background)',
                    color: 'var(--button-foreground)'
                  }}
                >
                  Profile
                </Link>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {session.user?.name && <div style={{ color: 'var(--text-primary)' }}>{session.user.name}</div>}
                  <div>{session.user?.email}</div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--error)',
                    color: 'white'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            // Only show login button when not on an auth page
            !isAuthPage && (
              <Link 
                href="/login" 
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'var(--button-background)',
                  color: 'var(--button-foreground)'
                }}
              >
                Sign In
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
