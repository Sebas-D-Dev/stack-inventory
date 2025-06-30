"use client";

import Link from "next/link";

interface EditButtonProps {
  editPath: string;
  itemName?: string;
}

export default function EditButton({ editPath, itemName = "item" }: EditButtonProps) {
  return (
    <Link
      href={editPath}
      className="px-4 py-2 rounded-lg transition-colors"
      style={{
        backgroundColor: "var(--button-background)",
        color: "var(--button-foreground)",
      }}
    >
      Edit {itemName}
    </Link>
  );
}