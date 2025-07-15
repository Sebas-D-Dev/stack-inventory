"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  minimumOrderQuantity: number;
  leadTime: number;
  categoryId: string;
  vendorId: string;
}

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const id = typeof params.id === "string" ? params.id : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch product, categories, and vendors in parallel
        const [productRes, categoriesRes, vendorsRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/categories"),
          fetch("/api/vendors"),
        ]);

        if (!productRes.ok) {
          throw new Error("Failed to fetch product");
        }

        const [productData, categoriesData, vendorsData] = await Promise.all([
          productRes.json(),
          categoriesRes.ok ? categoriesRes.json() : { categories: [] },
          vendorsRes.ok ? vendorsRes.json() : { vendors: [] },
        ]);

        setProduct(productData);
        setCategories(categoriesData.categories || []);
        setVendors(vendorsData.vendors || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, session, router]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!product) return;
    const { name, value, type } = e.target;

    setProduct({
      ...product,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      router.push(`/products/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--error)",
            color: "var(--error)",
          }}
        >
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <Link
            href="/products"
            className="mt-4 inline-block px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="p-6 rounded-lg border text-center"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Product Not Found
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            The product you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to edit it.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Edit Product
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Update the product information below
        </p>
      </div>

      <div
        className="rounded-lg shadow-sm p-6"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="form-label form-label-required">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="sku" className="form-label form-label-required">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={product.sku}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter SKU"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={product.description || ""}
              onChange={handleInputChange}
              rows={4}
              className="form-textarea"
              placeholder="Enter product description (optional)"
            />
          </div>

          {/* Category and Vendor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                value={product.categoryId}
                onChange={handleInputChange}
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
              <label
                htmlFor="vendorId"
                className="form-label form-label-required"
              >
                Vendor
              </label>
              <select
                id="vendorId"
                name="vendorId"
                value={product.vendorId}
                onChange={handleInputChange}
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
          </div>

          {/* Pricing and Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="form-label form-label-required">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="form-label form-label-required"
              >
                Current Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleInputChange}
                required
                min="0"
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumOrderQuantity" className="form-label">
                Minimum Order Quantity
              </label>
              <input
                type="number"
                id="minimumOrderQuantity"
                name="minimumOrderQuantity"
                value={product.minimumOrderQuantity || 1}
                onChange={handleInputChange}
                min="1"
                className="form-input"
                placeholder="1"
              />
            </div>

            <div>
              <label htmlFor="leadTime" className="form-label">
                Lead Time (days)
              </label>
              <input
                type="number"
                id="leadTime"
                name="leadTime"
                value={product.leadTime || 0}
                onChange={handleInputChange}
                min="0"
                className="form-input"
                placeholder="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Link
              href={`/products/${id}`}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
              }}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="form-button px-6 py-2"
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
