"use client";

import Form from "next/form";
import { useState, useEffect } from "react";
import { createProduct } from "./actions";

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

export default function NewProduct() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFormData() {
      setIsLoading(true);
      try {
        const [categoriesRes, vendorsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/vendors"),
        ]);

        if (!categoriesRes.ok || !vendorsRes.ok) {
          throw new Error("Failed to fetch form data");
        }

        const categoriesData = await categoriesRes.json();
        const vendorsData = await vendorsRes.json();

        setCategories(categoriesData.categories);
        setVendors(vendorsData.vendors);
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFormData();
  }, []);

  if (isLoading) {
    return (
      <div className="themed-loading-container themed-loading-fullscreen">
        <div className="themed-spinner"></div>
        <p className="themed-loading-text">Loading form...</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-2xl mx-auto p-6 rounded-lg my-8"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Add New Product
      </h1>

      <Form action={createProduct} className="space-y-6">
        <div>
          <label htmlFor="name" className="themed-label required-field">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Enter product name"
            className="themed-input"
          />
        </div>

        <div>
          <label htmlFor="sku" className="themed-label required-field">
            SKU
          </label>
          <input
            type="text"
            id="sku"
            name="sku"
            required
            placeholder="Enter unique SKU"
            className="themed-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="quantity"
              className="form-label form-label-required"
            >
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="0"
              className="form-input"
              defaultValue="0"
            />
          </div>

          <div>
            <label htmlFor="price" className="form-label form-label-required">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              className="form-input"
              defaultValue="0.00"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="reorderThreshold"
            className="form-label form-label-required"
          >
            Reorder Threshold
          </label>
          <input
            type="number"
            id="reorderThreshold"
            name="reorderThreshold"
            required
            min="1"
            className="form-input"
            defaultValue="5"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="form-label form-label-required"
          >
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="form-select"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vendorId" className="form-label form-label-required">
            Vendor
          </label>
          <select
            id="vendorId"
            name="vendorId"
            required
            className="form-select"
          >
            <option value="">Select a vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="form-button w-full py-3">
          Create Product
        </button>
      </Form>
    </div>
  );
}
