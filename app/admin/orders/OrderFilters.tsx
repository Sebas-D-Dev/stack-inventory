"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface OrderFiltersProps {
  currentFilters: {
    status?: string;
    vendorId?: string;
    requesterId?: string;
    startDate?: string;
    endDate?: string;
  };
  vendors: {
    id: string;
    name: string;
  }[];
  users: {
    id: string;
    name: string | null;
    email: string;
  }[];
}

export default function OrderFilters({
  currentFilters,
  vendors,
  users,
}: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    status: currentFilters.status || "",
    vendorId: currentFilters.vendorId || "",
    requesterId: currentFilters.requesterId || "",
    startDate: currentFilters.startDate || "",
    endDate: currentFilters.endDate || "",
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

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    // Remove existing filter params
    params.delete("status");
    params.delete("vendorId");
    params.delete("requesterId");
    params.delete("startDate");
    params.delete("endDate");
    params.delete("page"); // Reset to first page when filtering

    // Add new filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      vendorId: "",
      requesterId: "",
      startDate: "",
      endDate: "",
    });

    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("vendorId");
    params.delete("requesterId");
    params.delete("startDate");
    params.delete("endDate");
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div
      className="p-6 rounded-lg mb-6"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Filter Orders
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="form-select w-full"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Vendor
          </label>
          <select
            value={filters.vendorId}
            onChange={(e) =>
              setFilters({ ...filters, vendorId: e.target.value })
            }
            className="form-select w-full"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Requester Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Requested By
          </label>
          <select
            value={filters.requesterId}
            onChange={(e) =>
              setFilters({ ...filters, requesterId: e.target.value })
            }
            className="form-select w-full"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="form-input w-full"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="form-input w-full"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={applyFilters}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{
            backgroundColor: "var(--button-primary-background)",
            color: "var(--button-primary-foreground)",
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div
          className="mt-4 pt-4 border-t"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;

              let displayValue = value;
              if (key === "status") {
                const statusOption = statusOptions.find(
                  (opt) => opt.value === value
                );
                displayValue = statusOption?.label || value;
              } else if (key === "vendorId") {
                const vendor = vendors.find((v) => v.id === value);
                displayValue = vendor?.name || value;
              } else if (key === "requesterId") {
                const user = users.find((u) => u.id === value);
                displayValue = user?.name || user?.email || value;
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "var(--background-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  : {displayValue}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
