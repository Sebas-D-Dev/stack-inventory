"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/cn";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);

      // Check if user already exists
      const checkResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        setError(errorData.error || "Registration failed");
        return;
      }

      // Sign them in with the credentials they just registered with
      const signInResult = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(
          "Registration successful, but failed to sign in. Please try logging in manually."
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    } finally {
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
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-6">
            <div>
              <label htmlFor="name" className="themed-label">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="themed-input"
                placeholder="Full name"
              />
            </div>
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
                  <span>Registering...</span>
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
