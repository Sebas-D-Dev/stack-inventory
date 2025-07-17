"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { canAccessAdminFeatures, canModerateContent } from "@/lib/permissions";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import logoImage from "./logo.png";

export default function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsThemeOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items for desktop and mobile
  const navigationItems = [
    { href: "/posts", label: "Posts" },
    { href: "/dashboard", label: "Dashboard" },
    ...(session?.user
      ? [{ href: "/inventory-assistant", label: "AI Assistant" }]
      : []),
    ...(session?.user &&
    canAccessAdminFeatures(session.user.role || "") &&
    session.user.isAdmin
      ? [{ href: "/admin/dashboard", label: "Admin Dashboard" }]
      : []),
    ...(session?.user && canModerateContent(session.user.role || "")
      ? [{ href: "/admin/moderation", label: "Moderation" }]
      : []),
  ];

  return (
    <header
      className={cn(
        "w-full border-b transition-colors",
        "bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800"
      )}
      style={{
        padding: `var(--spacing-md) var(--spacing-lg)`,
      }}
    >
      <nav className="flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center" style={{ gap: `var(--spacing-sm)` }}>
          <Image
            src={logoImage}
            alt="Site Logo"
            width={32}
            height={32}
            priority
          />
          <Link
            href="/"
            className={cn(
              "font-bold transition-colors",
              "text-gray-900 dark:text-white"
            )}
            style={{ fontSize: `var(--font-xl)` }}
          >
            Stack Inventory
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div
          className="hidden dropdown:flex items-center"
          style={{ gap: `var(--spacing-md)` }}
        >
          {/* Navigation Links - Desktop */}
          {(!isAuthPage || session) && (
            <div
              className="flex items-center"
              style={{ gap: `var(--spacing-sm)` }}
            >
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(buttonVariants({ variant: "default" }))}
                  style={{
                    fontSize: `var(--font-sm)`,
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right side content */}
        <div
          className={cn(
            "flex items-center",
            // On auth pages without session, push theme switcher to the right
            !session && isAuthPage ? "ml-auto" : ""
          )}
          style={{ gap: `var(--spacing-sm)` }}
        >
          {/* Theme Switcher - Always visible */}
          <div className="relative">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className={cn(
                "flex items-center justify-center rounded-lg transition-colors",
                "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                "border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              style={{
                padding: `var(--spacing-sm)`,
              }}
              aria-label="Change theme"
            >
              {theme === "light" && (
                <SunIcon
                  style={{
                    width: `var(--spacing-lg)`,
                    height: `var(--spacing-lg)`,
                  }}
                />
              )}
              {theme === "dark" && (
                <MoonIcon
                  style={{
                    width: `var(--spacing-lg)`,
                    height: `var(--spacing-lg)`,
                  }}
                />
              )}
              {theme === "system" && (
                <ComputerDesktopIcon
                  style={{
                    width: `var(--spacing-lg)`,
                    height: `var(--spacing-lg)`,
                  }}
                />
              )}
            </button>

            {isThemeOpen && (
              <div
                className={cn(
                  "absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 border",
                  "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
                style={{
                  padding: `var(--spacing-xs) 0`,
                }}
              >
                <button
                  onClick={() => changeTheme("light")}
                  className={cn(
                    "flex items-center w-full text-left transition-colors",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  style={{
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                    fontSize: `var(--font-sm)`,
                    gap: `var(--spacing-sm)`,
                  }}
                >
                  <SunIcon
                    style={{
                      width: `var(--spacing-lg)`,
                      height: `var(--spacing-lg)`,
                    }}
                  />
                  Light
                </button>
                <button
                  onClick={() => changeTheme("dark")}
                  className={cn(
                    "flex items-center w-full text-left transition-colors",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  style={{
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                    fontSize: `var(--font-sm)`,
                    gap: `var(--spacing-sm)`,
                  }}
                >
                  <MoonIcon
                    style={{
                      width: `var(--spacing-lg)`,
                      height: `var(--spacing-lg)`,
                    }}
                  />
                  Dark
                </button>
                <button
                  onClick={() => changeTheme("system")}
                  className={cn(
                    "flex items-center w-full text-left transition-colors",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  style={{
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                    fontSize: `var(--font-sm)`,
                    gap: `var(--spacing-sm)`,
                  }}
                >
                  <ComputerDesktopIcon
                    style={{
                      width: `var(--spacing-lg)`,
                      height: `var(--spacing-lg)`,
                    }}
                  />
                  System
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle - Only show when navigation should be visible and below 1350px */}
          {(!isAuthPage || session) && (
            <button
              onClick={toggleMobileMenu}
              className={cn(
                "dropdown:hidden flex items-center justify-center rounded-lg transition-colors",
                "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                "border border-gray-200 dark:border-gray-700"
              )}
              style={{
                padding: `var(--spacing-sm)`,
              }}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon
                  style={{
                    width: `var(--spacing-lg)`,
                    height: `var(--spacing-lg)`,
                  }}
                />
              ) : (
                <Bars3Icon
                  style={{
                    width: `var(--spacing-lg)`,
                    height: `var(--spacing-lg)`,
                  }}
                />
              )}
            </button>
          )}

          {/* User Section - Desktop */}
          <div
            className="hidden dropdown:flex items-center"
            style={{ gap: `var(--spacing-md)` }}
          >
            {session ? (
              <>
                <Link
                  href="/profile"
                  className={cn(buttonVariants({ variant: "default" }))}
                  style={{
                    fontSize: `var(--font-sm)`,
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                  }}
                >
                  Profile
                </Link>
                <div
                  className={cn("text-gray-600 dark:text-gray-400")}
                  style={{ fontSize: `var(--font-sm)` }}
                >
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
                  style={{
                    fontSize: `var(--font-sm)`,
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              !isAuthPage && (
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "default" }))}
                  style={{
                    fontSize: `var(--font-sm)`,
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                  }}
                >
                  Sign In
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className="dropdown:hidden mt-4 border-t border-gray-200 dark:border-gray-700"
          style={{ paddingTop: `var(--spacing-md)` }}
        >
          <div className="flex flex-col" style={{ gap: `var(--spacing-sm)` }}>
            {/* Navigation Links - Mobile */}
            {(!isAuthPage || session) &&
              navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "w-full text-left transition-colors rounded-lg",
                    "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  style={{
                    padding: `var(--spacing-sm) var(--spacing-md)`,
                    fontSize: `var(--font-base)`,
                  }}
                >
                  {item.label}
                </Link>
              ))}

            {/* User Section - Mobile */}
            <div
              className="border-t border-gray-200 dark:border-gray-700"
              style={{
                paddingTop: `var(--spacing-sm)`,
                marginTop: `var(--spacing-sm)`,
              }}
            >
              {session ? (
                <div
                  className="flex flex-col"
                  style={{ gap: `var(--spacing-sm)` }}
                >
                  <div
                    className="text-gray-600 dark:text-gray-400"
                    style={{
                      padding: `var(--spacing-sm) var(--spacing-md)`,
                      fontSize: `var(--font-sm)`,
                    }}
                  >
                    {session.user?.name && (
                      <div className="text-gray-900 dark:text-white font-medium">
                        {session.user.name}
                      </div>
                    )}
                    <div>{session.user?.email}</div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "w-full text-left transition-colors rounded-lg",
                      "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    style={{
                      padding: `var(--spacing-sm) var(--spacing-md)`,
                      fontSize: `var(--font-base)`,
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full text-left transition-colors rounded-lg",
                      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    )}
                    style={{
                      padding: `var(--spacing-sm) var(--spacing-md)`,
                      fontSize: `var(--font-base)`,
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                !isAuthPage && (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "w-full text-left transition-colors rounded-lg",
                      "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    style={{
                      padding: `var(--spacing-sm) var(--spacing-md)`,
                      fontSize: `var(--font-base)`,
                    }}
                  >
                    Sign In
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
