"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vendor, Product } from "@prisma/client";

export default function NewPurchaseOrder() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [items, setItems] = useState<
    {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[]
  >([]);
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [vendorsRes, productsRes] = await Promise.all([
          fetch("/api/vendors"),
          fetch("/api/products"),
        ]);

        const vendorsData = await vendorsRes.json();
        const productsData = await productsRes.json();

        setVendors(vendorsData);
        setProducts(productsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  function addItem() {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
  }

  function updateItem(
    index: number,
    field: keyof (typeof items)[0],
    value: string | number
  ) {
    const updatedItems = [...items];
    if (field === "productId") {
      updatedItems[index].productId = value as string;
    } else if (field === "quantity") {
      updatedItems[index].quantity = value as number;
    } else if (field === "unitPrice") {
      updatedItems[index].unitPrice = value as number;
    }

    // Auto-fill price if selecting a product
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updatedItems[index].unitPrice = product.price;
      }
    }

    setItems(updatedItems);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function calculateTotal() {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    try {
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vendorId: selectedVendor,
          items,
          totalAmount: calculateTotal(),
          notes,
          expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        }),
      });

      if (response.ok) {
        router.push("/purchase-orders");
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to create purchase order: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      alert("An error occurred while creating the purchase order");
    }
  }

  if (isLoading) {
    return (
      <div className="themed-loading-container">
        <div className="themed-spinner"></div>
        <p className="themed-loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto p-6 rounded-lg my-8"
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
        Create Purchase Order
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="vendorId" className="form-label form-label-required">
            Vendor
          </label>
          <select
            id="vendorId"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
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

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="form-label form-label-required">Items</label>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 rounded-md text-sm"
              style={{
                backgroundColor: "var(--button-secondary-background)",
                color: "var(--button-secondary-foreground)",
              }}
            >
              Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div
              className="p-4 text-center rounded-md"
              style={{ backgroundColor: "var(--background-subtle)" }}
            >
              <p style={{ color: "var(--text-secondary)" }}>
                No items added yet. Click &quot;Add Item&quot; to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-md flex flex-wrap gap-3 items-end"
                  style={{ backgroundColor: "var(--background-subtle)" }}
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className="form-label text-sm">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, "productId", e.target.value)
                      }
                      required
                      className="form-select"
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="form-label text-sm">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", parseInt(e.target.value))
                      }
                      min="1"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="w-32">
                    <label className="form-label text-sm">Unit Price</label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="w-32">
                    <label className="form-label text-sm">Total</label>
                    <div
                      className="form-input bg-opacity-50"
                      style={{ backgroundColor: "var(--background)" }}
                    >
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 rounded-md text-sm"
                    style={{
                      backgroundColor: "var(--error-subtle)",
                      color: "var(--error)",
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="flex justify-end">
                <div
                  className="w-48 p-3 rounded-md font-semibold"
                  style={{ backgroundColor: "var(--background-subtle)" }}
                >
                  Total: ${calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="expectedDate" className="form-label">
            Expected Delivery Date
          </label>
          <input
            type="date"
            id="expectedDate"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-textarea"
            rows={3}
          />
        </div>

        <button type="submit" className="form-button w-full py-3">
          Create Purchase Order
        </button>
      </form>
    </div>
  );
}
