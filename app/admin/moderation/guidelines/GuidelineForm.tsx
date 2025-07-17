"use client";

import { useState } from "react";
import { createGuideline, updateGuideline } from "./actions";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import { textVariants } from "@/lib/ui-variants";

interface GuidelineFormProps {
  guideline?: {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
  };
}

export default function GuidelineForm({ guideline }: GuidelineFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(guideline?.title || "");
  const [description, setDescription] = useState(guideline?.description || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      setIsLoading(false);
      return;
    }

    try {
      if (guideline) {
        // Update existing guideline
        await updateGuideline(guideline.id, { title, description });
        setSuccess("Guideline updated successfully");

        // Redirect back to guidelines page after successful update
        setTimeout(() => {
          window.location.href = "/admin/moderation/guidelines";
        }, 1000);
      } else {
        // Create new guideline
        await createGuideline({ title, description });
        setSuccess("Guideline created successfully");
        // Reset form
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className={cn(
            textVariants({ variant: "small" }),
            "block mb-2 font-medium"
          )}
        >
          Guideline Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
            "rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "placeholder-gray-500 dark:placeholder-gray-400"
          )}
          placeholder="e.g., No offensive language"
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className={cn(
            textVariants({ variant: "small" }),
            "block mb-2 font-medium"
          )}
        >
          Guideline Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
            "rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "resize-vertical min-h-[100px]"
          )}
          rows={4}
          placeholder="Describe this guideline in detail. Be specific about what is and isn't allowed."
          required
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 text-sm">
            {success}
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className={cn(
            buttonVariants({ variant: "default" }),
            "min-w-[120px]"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>{guideline ? "Updating..." : "Creating..."}</span>
            </div>
          ) : guideline ? (
            "Update Guideline"
          ) : (
            "Create Guideline"
          )}
        </button>
      </div>
    </form>
  );
}
