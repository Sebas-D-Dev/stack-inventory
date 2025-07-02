"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string | null;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (!token) {
        setError("Reset token is missing");
        return;
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Validate password length
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess("Your password has been reset successfully. You can now login with your new password.");
      setPassword("");
      setConfirmPassword("");
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 themed-card">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold themed-span-primary">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Enter your new password below
          </p>
        </div>
        
        {!token ? (
          <div className="text-center space-y-4">
            <p className="text-red-500">Invalid or missing reset token.</p>
            <Link 
              href="/forgot-password" 
              className="form-button px-4 py-2 inline-block"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-6">
              <div>
                <label htmlFor="password" className="themed-label">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="themed-input"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="themed-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="themed-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            
            {success && (
              <div className="text-green-500 text-sm text-center">{success}</div>
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
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center space-y-2">
          <div>
            <Link href="/login" className="text-text-link hover:text-text-link-hover">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}