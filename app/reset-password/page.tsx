"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

// Client component that safely uses useSearchParams
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <ResetPasswordForm token={token} />;
}

// Main component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="themed-spinner"></div>
          <p className="ml-2">Loading...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
