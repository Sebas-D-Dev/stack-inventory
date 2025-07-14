import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Prevents Tailwind class conflicts by intelligently merging them
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
