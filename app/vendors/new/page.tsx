"use client";

import Form from "next/form";
import { useState } from "react";
import { createVendor } from "./actions";

export default function NewVendor() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    await createVendor(formData);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
      <h1 className="text-2xl font-bold mb-6 themed-span-primary">
        Add New Vendor
      </h1>

      <Form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="themed-label required-field">
            Vendor Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Enter vendor name"
            className="themed-input"
          />
        </div>

        <div>
          <label htmlFor="website" className="themed-label">
            Website URL
          </label>
          <input
            type="url"
            id="website"
            name="website"
            placeholder="https://example.com"
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
              <span>Creating Vendor...</span>
            </>
          ) : (
            "Create Vendor"
          )}
        </button>
      </Form>
    </div>
  );
}
