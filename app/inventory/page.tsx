"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@prisma/client";

export default function AdjustInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [type, setType] = useState("ADJUSTMENT");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products);
      setIsLoading(false);
    }

    fetchProducts();
  }, []);

  // Pre-populate form based on URL parameters
  useEffect(() => {
    const productId = searchParams.get("productId");
    const adjustmentType = searchParams.get("adjustmentType");

    if (productId) {
      setSelectedProduct(productId);
    }

    if (adjustmentType) {
      // Map the adjustmentType to the correct form value
      const typeMap: Record<string, string> = {
        Purchase: "PURCHASE",
        Sale: "SALE",
        Return: "RETURN",
        Loss: "LOSS",
        Adjustment: "ADJUSTMENT",
      };

      setType(typeMap[adjustmentType] || "ADJUSTMENT");

      // Set default reason based on type
      if (adjustmentType === "Purchase") {
        setReason("Restocking low inventory");
      }
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("/api/inventory/movement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: selectedProduct,
          quantity: parseInt(quantity.toString()),
          type,
          reason,
        }),
      });

      if (response.ok) {
        router.push("/products");
        router.refresh();
      } else {
        console.error("Failed to adjust inventory");
      }
    } catch (error) {
      console.error("Error adjusting inventory:", error);
    }
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
        Adjust Inventory
      </h1>

      {isLoading ? (
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading products...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="productId"
              className="form-label form-label-required"
            >
              Product
            </label>
            <select
              id="productId"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              required
              className="form-select"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) - Current: {product.quantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="form-label form-label-required">
              Adjustment Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="form-select"
            >
              <option value="ADJUSTMENT">Manual Adjustment</option>
              <option value="PURCHASE">Purchase</option>
              <option value="SALE">Sale</option>
              <option value="RETURN">Return</option>
              <option value="LOSS">Loss/Damage</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="form-label form-label-required"
            >
              Quantity Change
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
              className="form-input"
              placeholder="Use negative values for removal"
            />
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Use positive values to add stock, negative to remove
            </p>
          </div>

          <div>
            <label htmlFor="reason" className="form-label form-label-required">
              Reason
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="form-textarea"
              rows={3}
            />
          </div>

          <button type="submit" className="form-button w-full py-3">
            Submit Adjustment
          </button>
        </form>
      )}
    </div>
  );
}
