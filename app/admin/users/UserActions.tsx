"use client";

import { useState } from "react";
import { 
  toggleAdminStatus, 
  toggleUserStatus, 
  resetUserPassword 
} from "./actions";
import Link from "next/link";

interface UserActionsProps {
  userId: string;
  isAdmin: boolean;
  isDisabled: boolean;
  currentUserId: string;
}

export default function UserActions({ 
  userId, 
  isAdmin, 
  isDisabled,
  currentUserId 
}: UserActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const isSelf = userId === currentUserId;

  async function handleAdminToggle() {
    try {
      setIsLoading("admin");
      await toggleAdminStatus(userId, !isAdmin);
    } finally {
      setIsLoading(null);
    }
  }

  async function handleStatusToggle() {
    try {
      setIsLoading("status");
      await toggleUserStatus(userId, !isDisabled);
    } finally {
      setIsLoading(null);
    }
  }

  async function handlePasswordReset() {
    try {
      setIsLoading("reset");
      const newPassword = await resetUserPassword(userId);
      alert(`Password has been reset to: ${newPassword}`);
      setShowResetModal(false);
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleAdminToggle}
        disabled={isLoading !== null || (isSelf && isAdmin)}
        className="px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: isAdmin ? "var(--error-light)" : "var(--success-light)",
          color: isAdmin ? "var(--error)" : "var(--success)",
          opacity: isSelf && isAdmin ? 0.5 : 1,
          cursor: isSelf && isAdmin ? "not-allowed" : "pointer"
        }}
        title={isSelf && isAdmin ? "Cannot remove your own admin status" : ""}
      >
        {isLoading === "admin" ? "..." : isAdmin ? "Remove Admin" : "Make Admin"}
      </button>
      
      <button
        onClick={handleStatusToggle}
        disabled={isLoading !== null || isSelf}
        className="px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: isDisabled ? "var(--success-light)" : "var(--error-light)",
          color: isDisabled ? "var(--success)" : "var(--error)",
          opacity: isSelf ? 0.5 : 1,
          cursor: isSelf ? "not-allowed" : "pointer"
        }}
        title={isSelf ? "Cannot disable your own account" : ""}
      >
        {isLoading === "status" ? "..." : isDisabled ? "Enable User" : "Disable User"}
      </button>
      
      <button
        onClick={() => setShowResetModal(true)}
        disabled={isLoading !== null}
        className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800"
      >
        {isLoading === "reset" ? "..." : "Reset Password"}
      </button>
      
      <Link
        href={`/admin/users/${userId}/activity`}
        className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800"
      >
        View Activity
      </Link>

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Reset User Password</h3>
            <p className="mb-4">Are you sure you want to reset this user&apos;s password? They will need to use the new password to log in.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordReset}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}