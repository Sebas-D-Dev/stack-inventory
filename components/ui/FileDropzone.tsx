"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/cn";
import { cardVariants, textVariants } from "@/lib/ui-variants";

interface FileDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function FileDropzone({
  onDrop,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif"],
  },
  maxFiles = 1,
  disabled = false,
  className,
  children,
}: FileDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: onDropCallback,
      accept,
      maxFiles,
      disabled,
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        cardVariants({ variant: "outline", size: "lg" }),
        "cursor-pointer transition-colors text-center",
        isDragActive && "border-blue-500 bg-blue-50 dark:bg-blue-950",
        isDragReject && "border-red-500 bg-red-50 dark:bg-red-950",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      {children ? (
        children
      ) : (
        <div className="py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <p className={cn(textVariants({ variant: "body" }))}>
              {isDragActive
                ? "Drop the files here..."
                : "Drag 'n' drop files here, or click to select"}
            </p>
            <p className={cn(textVariants({ variant: "small" }), "mt-2")}>
              {accept["image/*"] && "Images only"} (max {maxFiles} file
              {maxFiles !== 1 ? "s" : ""})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
