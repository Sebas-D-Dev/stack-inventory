import { type VariantProps, cva } from "class-variance-authority";

export const cardVariants = cva(
  "rounded-lg border shadow-sm transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
        secondary: "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700",
        outline: "border-2 border-dashed border-gray-300 dark:border-gray-600",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const inputVariants = cva(
  "flex w-full rounded-md border px-3 py-2 text-sm transition-colors",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400",
        error: "border-red-500 bg-white text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-400 dark:bg-gray-800 dark:text-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-3xl font-bold text-gray-900 dark:text-white",
      h2: "text-2xl font-semibold text-gray-900 dark:text-white",
      h3: "text-xl font-medium text-gray-900 dark:text-white",
      body: "text-gray-700 dark:text-gray-300",
      muted: "text-gray-500 dark:text-gray-400",
      small: "text-sm text-gray-600 dark:text-gray-400",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-gray-700 dark:text-gray-300",
        required: "text-gray-700 dark:text-gray-300 after:content-['*'] after:text-red-500 after:ml-1",
        error: "text-red-600 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type TextVariants = VariantProps<typeof textVariants>;
export type LabelVariants = VariantProps<typeof labelVariants>;
