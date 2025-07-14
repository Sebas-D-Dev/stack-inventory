"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import { textVariants } from "@/lib/ui-variants";

interface ConfirmDialogProps {
  title: string;
  description: string;
  trigger: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export default function ConfirmDialog({
  title,
  description,
  trigger,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200",
            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          <div className="flex flex-col space-y-2 text-center sm:text-left">
            <Dialog.Title className={cn(textVariants({ variant: "h3" }))}>
              {title}
            </Dialog.Title>

            <Dialog.Description
              className={cn(textVariants({ variant: "muted" }))}
            >
              {description}
            </Dialog.Description>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Dialog.Close asChild>
              <button
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </Dialog.Close>

            <Dialog.Close asChild>
              <button
                className={cn(
                  buttonVariants({
                    variant:
                      variant === "destructive" ? "destructive" : "default",
                  })
                )}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
