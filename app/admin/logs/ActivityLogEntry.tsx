"use client";

import { useState } from "react";

interface ActivityLogEntryProps {
  log: {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string;
      role: string;
    };
  };
}

export default function ActivityLogEntry({ log }: ActivityLogEntryProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getActionColor = (action: string) => {
    const actionColors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-purple-100 text-purple-800",
      LOGOUT: "bg-gray-100 text-gray-800",
      APPROVE: "bg-indigo-100 text-indigo-800",
      REJECT: "bg-orange-100 text-orange-800",
    };

    // Check for partial matches
    for (const [key, color] of Object.entries(actionColors)) {
      if (action.includes(key)) {
        return color;
      }
    }

    return "bg-gray-100 text-gray-800";
  };

  const getEntityTypeIcon = (entityType: string) => {
    const icons: Record<string, string> = {
      PRODUCT: "📦",
      USER: "👤",
      PURCHASE_ORDER: "🛒",
      VENDOR: "🏢",
      CATEGORY: "📁",
      SETTINGS: "⚙️",
      POST: "📝",
      NOTIFICATION: "🔔",
    };

    return icons[entityType] || "📄";
  };

  const formatActionText = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatEntityType = (entityType: string) => {
    return entityType
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const parseDetails = (details: string | null) => {
    if (!details) return null;
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  const renderDetails = (details: unknown) => {
    if (!details) return null;

    if (typeof details === "string") {
      return details;
    }

    if (typeof details === "object" && details !== null) {
      return (
        <div className="text-xs">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="font-medium">{key}:</span>{" "}
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }

    return String(details);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "MODERATOR":
        return "bg-green-100 text-green-800";
      case "VENDOR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const parsedDetails = parseDetails(log.details);

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {new Date(log.createdAt).toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {new Date(log.createdAt).toLocaleDateString()}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            {log.user.name || log.user.email}
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(
                log.user.role
              )}`}
            >
              {log.user.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(
            log.action
          )}`}
        >
          {formatActionText(log.action)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getEntityTypeIcon(log.entityType)}</span>
          <div>
            <div
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {formatEntityType(log.entityType)}
            </div>
            <div
              className="text-xs font-mono"
              style={{ color: "var(--text-secondary)" }}
            >
              ID: {log.entityId.slice(-8)}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        {parsedDetails ? (
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-900 font-medium"
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
            {showDetails && (
              <div
                className="mt-2 p-3 rounded-md max-w-md"
                style={{ backgroundColor: "var(--background-subtle)" }}
              >
                {renderDetails(parsedDetails)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No details
          </span>
        )}
      </td>
    </tr>
  );
}
