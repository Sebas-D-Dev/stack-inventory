"use client";

import { useState } from "react";
import { deleteGuideline } from "./actions";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";

interface DeleteGuidelineButtonProps {
  id: string;
  title: string;
}

export default function DeleteGuidelineButton({
  id,
  title,
}: DeleteGuidelineButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    try {
      await deleteGuideline(id);
      // The page will refresh automatically due to revalidatePath
    } catch (error) {
      console.error("Error deleting guideline:", error);
      alert("Failed to delete guideline");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ConfirmDialog
      title="Delete Guideline"
      description={`Are you sure you want to delete the guideline "${title}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={handleDelete}
      trigger={
        <button
          className={cn(buttonVariants({ variant: "destructive", size: "sm" }))}
          disabled={isLoading}
        >
          {isLoading ? "Deleting..." : "Delete"}
        </button>
      }
    />
  );
}
