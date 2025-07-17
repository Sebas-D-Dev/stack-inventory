"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      setIsLoading(true);
      setError(null);

      const formData = new FormData(event.currentTarget);
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || "/";

      const response = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      if (response?.error) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }

      if (response?.ok) {
        // Give a small delay to ensure session is properly set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Use window.location for more reliable redirect in production
        if (response.url) {
          window.location.href = response.url;
        } else {
          window.location.href = callbackUrl;
        }
      } else {
        setError("An error occurred during login");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          "max-w-md w-full space-y-8 p-6 rounded-lg",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
        )}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-6">
            <div>
              <label htmlFor="email" className="themed-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="themed-input"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="themed-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="themed-input"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="form-button w-full py-3 flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="themed-spinner themed-spinner-sm mr-2"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>
        <div className="text-center space-y-2">
          <div>
            <Link
              href="/forgot-password"
              className="text-text-link hover:text-text-link-hover m-4"
            >
              Forgot your password?
            </Link>
            <Link
              href="/register"
              className="text-text-link hover:text-text-link-hover m-4"
            >
              No account? Register.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
