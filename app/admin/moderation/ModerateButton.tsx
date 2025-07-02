"use client";

import { useState } from "react";
import { moderateContent } from "./actions";

interface ModerateButtonProps {
  id: string;
  type: "post" | "comment";
  action: "approve" | "reject";
}

export default function ModerateButton({
  id,
  type,
  action,
}: ModerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reason, setReason] = useState("");

  async function handleModeration(e: React.MouseEvent, rejectReason?: string) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await moderateContent({
        id,
        type,
        action,
        reason: rejectReason,
      });
    } catch (error) {
      console.error("Error moderating content:", error);
      alert("Failed to moderate content");
    } finally {
      setIsLoading(false);
      setShowRejectModal(false);
    }
  }

  if (action === "approve") {
    return (
      <button
        onClick={(e) => handleModeration(e)}
        disabled={isLoading}
        className="px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: "var(--success-light)",
          color: "var(--success)",
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? "..." : "Approve"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowRejectModal(true)}
        disabled={isLoading}
        className="px-2 py-1 rounded text-xs"
        style={{
          backgroundColor: "var(--error-light)",
          color: "var(--error)",
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? "..." : "Reject"}
      </button>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Rejection Reason</h3>
            <p className="mb-4">
              Please provide a reason for rejecting this content:
            </p>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-textarea w-full mb-4"
              rows={3}
              placeholder="Enter rejection reason..."
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleModeration(e, reason)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Reject Content
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
