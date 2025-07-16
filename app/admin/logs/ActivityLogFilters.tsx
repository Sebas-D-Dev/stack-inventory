"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface ActivityLogFiltersProps {
  uniqueActions: { action: string }[];
  uniqueEntityTypes: { entityType: string }[];
  allUsers: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  }[];
  currentFilters: {
    action?: string;
    entityType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default function ActivityLogFilters({
  uniqueActions,
  uniqueEntityTypes,
  allUsers,
  currentFilters,
}: ActivityLogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    action: currentFilters.action || "",
    entityType: currentFilters.entityType || "",
    userId: currentFilters.userId || "",
    startDate: currentFilters.startDate || "",
    endDate: currentFilters.endDate || "",
  });

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);

    // Remove existing filter params
    params.delete("action");
    params.delete("entityType");
    params.delete("userId");
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
      action: "",
      entityType: "",
      userId: "",
      startDate: "",
      endDate: "",
    });

    const params = new URLSearchParams(searchParams);
    params.delete("action");
    params.delete("entityType");
    params.delete("userId");
    params.delete("startDate");
    params.delete("endDate");
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
      }}
    >
      <h3
        className="text-lg font-medium mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Filters
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Action Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Action
          </label>
          <select
            value={filters.action}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, action: e.target.value }))
            }
            className="form-select"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((item) => (
              <option key={item.action} value={item.action}>
                {item.action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Type Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Entity Type
          </label>
          <select
            value={filters.entityType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, entityType: e.target.value }))
            }
            className="form-select"
          >
            <option value="">All Types</option>
            {uniqueEntityTypes.map((item) => (
              <option key={item.entityType} value={item.entityType}>
                {item.entityType.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            User
          </label>
          <select
            value={filters.userId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, userId: e.target.value }))
            }
            className="form-select"
          >
            <option value="">All Users</option>
            {allUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.role})
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
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="form-input"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="form-input"
          />
        </div>
      </div>

      <div className="flex space-x-3 mt-6">
        <button onClick={applyFilters} className="form-button">
          Apply Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: "var(--button-secondary-background)",
              color: "var(--button-secondary-foreground)",
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
