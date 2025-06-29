"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  reorderThreshold: number;
  category: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
  };
}

// Disable static generation
export const dynamic = "force-dynamic";

function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products`);
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2 min-h-[200px]">
          <div
            className="w-6 h-6 border-4 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: "var(--button-background)",
              borderTopColor: "transparent",
            }}
          ></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Products
            </h1>
            <Link
              href="/products/new"
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
              }}
            >
              Add New Product
            </Link>
          </div>

          {products.length === 0 ? (
            <p
              className="text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              No products available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="min-w-full"
                style={{
                  backgroundColor: "var(--table-background)",
                }}
              >
                <thead
                  style={{ backgroundColor: "var(--table-header-background)" }}
                >
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      SKU
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      Category
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      Vendor
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      Quantity
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      Price
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: "var(--table-header-foreground)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  style={{
                    borderColor: "var(--table-border)",
                    borderTopWidth: "1px",
                  }}
                >
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      style={{
                        borderColor: "var(--table-border)",
                        borderTopWidth: "1px",
                      }}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                        style={{ color: "var(--table-cell-foreground-strong)" }}
                      >
                        {product.name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        {product.sku}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        {product.category.name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        {product.vendor.name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        <span
                          className={`${
                            product.quantity <= product.reorderThreshold
                              ? "text-red-600 font-medium"
                              : ""
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        ${product.price.toFixed(2)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        <Link
                          href={`/products/${product.id}`}
                          className="text-blue-500 hover:underline mr-3"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: "var(--button-background)",
                borderTopColor: "transparent",
              }}
            ></div>
            <p className="ml-3" style={{ color: "var(--text-secondary)" }}>
              Loading page...
            </p>
          </div>
        }
      >
        <ProductsList />
      </Suspense>
    </div>
  );
}
