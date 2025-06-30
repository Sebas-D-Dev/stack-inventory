"use client";

import Form from "next/form";
import { useState } from "react";
import { createCategory } from "./actions";

export default function NewCategory() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    await createCategory(formData);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
      <h1 className="text-2xl font-bold mb-6 themed-span-primary">
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