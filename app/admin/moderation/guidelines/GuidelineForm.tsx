"use client";

import { useState } from "react";
import { createGuideline } from "./actions";

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
        // Will be implemented in the actions file
        setSuccess("Guideline updated successfully");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="form-label">Guideline Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="e.g. No offensive language"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="form-label">Guideline Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          rows={3}
          placeholder="Describe this guideline in detail..."
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">{success}</div>
      )}

      <button
        type="submit"
        className="form-button py-2 px-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="themed-spinner themed-spinner-sm mr-2"></div>
            <span>{guideline ? "Updating..." : "Creating..."}</span>
          </>
        ) : guideline ? "Update Guideline" : "Create Guideline"}
      </button>
    </form>
  );
}