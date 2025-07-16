"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusDropdownProps {
  order: {
    id: string;
    status: string;
    requesterId: string;
    approverId: string | null;
  };
  currentUserRole: string;
}

export default function OrderStatusDropdown({
  order,
  currentUserRole,
}: OrderStatusDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const router = useRouter();

  const canApprove =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";
  const canCancel =
    currentUserRole === "ADMIN" || currentUserRole === "SUPER_ADMIN";

  const statusOptions = [
    { value: "DRAFT", label: "Draft", disabled: false },
    { value: "PENDING_APPROVAL", label: "Pending Approval", disabled: false },
    { value: "APPROVED", label: "Approved", disabled: !canApprove },
    { value: "ORDERED", label: "Ordered", disabled: false },
    {
      value: "PARTIALLY_RECEIVED",
      label: "Partially Received",
      disabled: false,
    },
    { value: "RECEIVED", label: "Received", disabled: false },
    { value: "CANCELLED", label: "Cancelled", disabled: !canCancel },
  ];

  async function updateOrderStatus(newStatus: string) {
    if (newStatus === order.status) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to update order status");
        // Reset dropdown to original status on error
        setSelectedStatus(order.status);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      // Reset dropdown to original status on error
      setSelectedStatus(order.status);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "ORDERED":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "PARTIALLY_RECEIVED":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "RECEIVED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Order Status
      </label>
      <select
        value={selectedStatus}
        onChange={(e) => {
          setSelectedStatus(e.target.value);
          updateOrderStatus(e.target.value);
        }}
        disabled={isLoading}
        className={`w-full px-3 py-2 text-sm font-medium rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${getStatusColor(
          selectedStatus
        )}`}
      >
        {statusOptions.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="text-gray-900 bg-white"
          >
            {option.label}
            {option.disabled ? " (No Permission)" : ""}
          </option>
        ))}
      </select>
      {isLoading && (
        <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
          Updating status...
        </div>
      )}
    </div>
  );
}
