"use client";

import { useTransition } from 'react';

interface DeleteButtonProps {
  deleteAction: () => Promise<void>;
  itemName?: string;
}

export default function DeleteButton({ deleteAction, itemName = "item" }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this ${itemName}?`)) {
      startTransition(() => {
        deleteAction();
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="px-4 py-2 rounded-lg transition-colors"
      disabled={isPending}
      style={{
        backgroundColor: "var(--error)",
        color: "white",
        opacity: isPending ? 0.7 : 1
      }}
    >
      {isPending ? `Deleting...` : `Delete ${itemName}`}
    </button>
  );
}