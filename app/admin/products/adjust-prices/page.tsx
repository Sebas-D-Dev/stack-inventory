"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function AdjustPricesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("percentage");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };
    fetchCategories();
  }, []);

  const handleAdjustPrices = async () => {
    if (!selectedCategory || !adjustmentValue) {
      setError("Please select a category and enter an adjustment value.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/products/adjust-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: selectedCategory,
          adjustmentType,
          adjustmentValue: parseFloat(adjustmentValue),
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to adjust prices.");
      }

      setSuccess("Prices adjusted successfully.");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Adjust Prices by Category
        </h1>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Back to Products Management
          </Link>
        </div>
      </div>

      <div
        className="rounded-lg shadow-sm p-6"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 block w-full p-2 rounded-md border"
            style={{
              backgroundColor: "var(--input-background)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="">Select a category</option>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Adjustment Type
          </label>
          <select
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value)}
            className="mt-1 block w-full p-2 rounded-md border"
            style={{
              backgroundColor: "var(--input-background)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Adjustment Value
          </label>
          <input
            type="number"
            value={adjustmentValue}
            onChange={(e) => setAdjustmentValue(e.target.value)}
            className="mt-1 block w-full p-2 rounded-md border"
            placeholder={adjustmentType === "percentage" ? "%" : "$"}
            style={{
              backgroundColor: "var(--input-background)",
              borderColor: "var(--input-border)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <button
          onClick={handleAdjustPrices}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isLoading
              ? "var(--muted)"
              : "var(--button-background)",
            color: "var(--button-foreground)",
          }}
        >
          {isLoading ? "Adjusting..." : "Adjust Prices"}
        </button>

        {error && (
          <p className="mt-4" style={{ color: "var(--error)" }}>
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4" style={{ color: "var(--success)" }}>
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
