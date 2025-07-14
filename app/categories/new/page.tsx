"use client";

import Form from "next/form";
import { useState } from "react";
import { createCategory } from "./actions";
import { cn } from "@/lib/cn";

export default function NewCategory() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    await createCategory(formData);
  }

  return (
    <div
      className={cn(
        "max-w-2xl mx-auto p-6 rounded-lg my-8",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
      )}
    >
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Add New Category
      </h1>

      <Form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="themed-label required-field">
            Category Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Enter category name"
            className="themed-input"
          />
        </div>

        <button
          type="submit"
          className="form-button w-full py-3 flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="themed-spinner themed-spinner-sm mr-2"></div>
              <span>Creating Category...</span>
            </>
          ) : (
            "Create Category"
          )}
        </button>
      </Form>
    </div>
  );
}
