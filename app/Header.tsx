"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { canAccessAdminFeatures } from "@/lib/permissions";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Check if current path is login or register page
  const authPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/setup",
  ];
  const isAuthPage = authPaths.includes(pathname);

  // Handle theme change
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <header
      className={cn(
        "w-full py-4 px-8 border-b transition-colors",
        "bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800"
      )}
    >
      <nav className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Site Logo"
            width={32}
            height={32}
            priority
          />
          <Link
            href="/"
            className={cn(
              "text-xl font-bold transition-colors",
              "text-gray-900 dark:text-white"
            )}
          >
            Stack Inventory
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Switcher - Always visible */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "flex items-center justify-center p-2 rounded-lg transition-colors",
                "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                "border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              aria-label="Change theme"
            >
              {theme === "light" && <SunIcon className="h-5 w-5" />}
              {theme === "dark" && <MoonIcon className="h-5 w-5" />}
              {theme === "system" && (
                <ComputerDesktopIcon className="h-5 w-5" />
              )}
            </button>

            {isOpen && (
              <div
                className={cn(
                  "absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 border",
                  "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
              >
                <button
                  onClick={() => changeTheme("light")}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm w-full text-left transition-colors",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <SunIcon className="h-5 w-5 mr-2" />
                  Light
                </button>
                <button
                  onClick={() => changeTheme("dark")}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm w-full text-left transition-colors",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <MoonIcon className="h-5 w-5 mr-2" />
                  Dark
                </button>
                <button
                  onClick={() => changeTheme("system")}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm w-full text-left transition-colors",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
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
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Posts
              </Link>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Dashboard
              </Link>
              {session?.user && (
                <Link
                  href="/inventory-assistant"
                  className={cn(buttonVariants({ variant: "default" }))}
                >
                  AI Assistant
                </Link>
              )}
              {session?.user &&
                canAccessAdminFeatures(session.user.role || "") && (
                  <Link
                    href="/admin/dashboard"
                    className={cn(buttonVariants({ variant: "default" }))}
                  >
                    Admin Dashboard
                  </Link>
                )}
            </>
          )}
        </div>

        {/* Authenticated user section */}
        {session ? (
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Profile
            </Link>
            <div className={cn("text-sm", "text-gray-600 dark:text-gray-400")}>
              {session.user?.name && (
                <div className={cn("text-gray-900 dark:text-white")}>
                  {session.user.name}
                </div>
              )}
              <div>{session.user?.email}</div>
            </div>
            <button
              onClick={() => signOut()}
              className={cn(buttonVariants({ variant: "destructive" }))}
            >
              Sign Out
            </button>
          </div>
        ) : (
          // Only show login button when not on an auth page
          !isAuthPage && (
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Sign In
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
