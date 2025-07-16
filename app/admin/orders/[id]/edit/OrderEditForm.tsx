"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderEditFormProps {
  order: {
    id: string;
    status: string;
    notes: string | null;
    orderDate: Date | null;
    expectedDate: Date | null;
    receivedDate: Date | null;
    totalAmount: number;
    vendor: {
      id: string;
      name: string;
      website: string | null;
    };
    requestedBy: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
    approvedBy: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      product: {
        id: string;
        name: string;
        sku: string;
        description: string | null;
        quantity: number;
        price: number;
        category: {
          name: string;
        };
      };
    }>;
  };
  vendors: Array<{
    id: string;
    name: string;
  }>;
  currentUserRole: string;
}

export default function OrderEditForm({
  order,
  vendors,
  currentUserRole,
}: OrderEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    status: order.status,
    notes: order.notes || "",
    orderDate: order.orderDate
      ? new Date(order.orderDate).toISOString().split("T")[0]
      : "",
    expectedDate: order.expectedDate
      ? new Date(order.expectedDate).toISOString().split("T")[0]
      : "",
    receivedDate: order.receivedDate
      ? new Date(order.receivedDate).toISOString().split("T")[0]
      : "",
    vendorId: order.vendor.id,
  });

  const statusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING_APPROVAL", label: "Pending Approval" },
    { value: "APPROVED", label: "Approved" },
    { value: "ORDERED", label: "Ordered" },
    { value: "PARTIALLY_RECEIVED", label: "Partially Received" },
    { value: "RECEIVED", label: "Received" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const canApprove =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";
  const canCancel =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "ORDERED":
        return "bg-indigo-100 text-indigo-800";
      case "PARTIALLY_RECEIVED":
        return "bg-orange-100 text-orange-800";
      case "RECEIVED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: formData.status,
          notes: formData.notes,
          orderDate: formData.orderDate || null,
          expectedDate: formData.expectedDate || null,
          receivedDate: formData.receivedDate || null,
          vendorId: formData.vendorId,
        }),
      });

      if (response.ok) {
        router.push(`/admin/orders/${order.id}`);
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isStatusDisabled = (status: string) => {
    if (status === "APPROVED" && !canApprove) return true;
    if (status === "CANCELLED" && !canCancel) return true;
    return false;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/orders/${order.id}`}
              className="text-sm font-medium hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              ← Back to Order Details
            </Link>
            <h1
              className="text-3xl font-bold mt-2"
              style={{ color: "var(--text-primary)" }}
            >
              Edit Order #{order.id.slice(-8)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                formData.status
              )}`}
            >
              {formData.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Information */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Order Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="form-select w-full"
                    disabled={isLoading}
                  >
                    {statusOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        disabled={isStatusDisabled(option.value)}
                      >
                        {option.label}
                        {isStatusDisabled(option.value)
                          ? " (No Permission)"
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendor */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Vendor
                  </label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) =>
                      setFormData({ ...formData, vendorId: e.target.value })
                    }
                    className="form-select w-full"
                    disabled={isLoading}
                  >
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Date */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) =>
                      setFormData({ ...formData, orderDate: e.target.value })
                    }
                    className="form-input w-full"
                    disabled={isLoading}
                  />
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedDate: e.target.value })
                    }
                    className="form-input w-full"
                    disabled={isLoading}
                  />
                </div>

                {/* Received Date */}
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Received Date
                  </label>
                  <input
                    type="date"
                    value={formData.receivedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, receivedDate: e.target.value })
                    }
                    className="form-input w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  className="form-textarea w-full"
                  placeholder="Add any notes about this order..."
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Order Items (Read-only) */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Order Items ({order.items.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    style={{ backgroundColor: "var(--background-subtle)" }}
                  >
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Product
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        SKU
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Quantity
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Unit Price
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className="divide-y divide-gray-200"
                    style={{ backgroundColor: "var(--card-background)" }}
                  >
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {item.product.name}
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {item.product.category.name}
                            </div>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.product.sku}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot
                    style={{ backgroundColor: "var(--background-subtle)" }}
                  >
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-3 text-right text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Total Amount:
                      </td>
                      <td
                        className="px-6 py-3 text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ${order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Order Info */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Current Order Info
              </h3>
              <div className="space-y-3">
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Order ID
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    #{order.id.slice(-8)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Total Amount
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Items Count
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {order.items.length} items
                  </div>
                </div>
              </div>
            </div>

            {/* People Involved */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                People Involved
              </h3>
              <div className="space-y-4">
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Requested By
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {order.requestedBy.name || order.requestedBy.email}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {order.requestedBy.role}
                  </div>
                </div>
                {order.approvedBy && (
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Approved By
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.approvedBy.name || order.approvedBy.email}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="block w-full px-4 py-2 text-sm font-medium rounded-md text-center border hover:opacity-80"
                  style={{
                    backgroundColor: "var(--button-primary-background)",
                    color: "var(--button-primary-foreground)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="block w-full px-4 py-2 text-sm font-medium rounded-md text-center border hover:opacity-80"
                  style={{
                    backgroundColor: "var(--button-secondary-background)",
                    color: "var(--button-secondary-foreground)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
