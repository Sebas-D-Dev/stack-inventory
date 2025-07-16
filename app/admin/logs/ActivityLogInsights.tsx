"use client";

import { useState } from "react";

interface ActivityLogInsightsProps {
  stats: {
    totalLogs: number;
    uniqueUsers: number;
    timeRange: {
      earliest: Date;
      latest: Date;
    } | null;
  };
  topActions: Array<{
    action: string;
    count: number;
  }>;
  topUsers: Array<{
    user: {
      name: string | null;
      email: string;
      role: string;
    };
    count: number;
  }>;
}

export default function ActivityLogInsights({
  stats,
  topActions,
  topUsers,
}: ActivityLogInsightsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
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

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {stats.totalLogs.toLocaleString()}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Total Activities
          </div>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {stats.uniqueUsers}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Active Users
          </div>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {stats.timeRange
              ? Math.ceil(
                  (stats.timeRange.latest.getTime() -
                    stats.timeRange.earliest.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : 0}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Days of Activity
          </div>
        </div>
      </div>

      {/* Expandable Insights */}
      <div className="space-y-4">
        {/* Top Actions */}
        <div
          className="rounded-lg"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <button
            onClick={() => toggleSection("actions")}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50 hover:bg-gray-50"
          >
            <h3
              className="text-lg font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Most Common Actions
            </h3>
            <span style={{ color: "var(--text-secondary)" }}>
              {expandedSection === "actions" ? "−" : "+"}
            </span>
          </button>
          {expandedSection === "actions" && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {topActions.slice(0, 10).map((action, index) => (
                  <div
                    key={action.action}
                    className="flex items-center justify-between"
                  >
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      #{index + 1}{" "}
                      {action.action.replace("_", " ").toLowerCase()}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {action.count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Users */}
        <div
          className="rounded-lg"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <button
            onClick={() => toggleSection("users")}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50 hover:bg-gray-50"
          >
            <h3
              className="text-lg font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Most Active Users
            </h3>
            <span style={{ color: "var(--text-secondary)" }}>
              {expandedSection === "users" ? "−" : "+"}
            </span>
          </button>
          {expandedSection === "users" && (
            <div className="px-4 pb-4">
              <div className="space-y-3">
                {topUsers.slice(0, 10).map((userStat, index) => (
                  <div
                    key={userStat.user.email}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {userStat.user.name || userStat.user.email}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                            userStat.user.role
                          )}`}
                        >
                          {userStat.user.role}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {userStat.count} actions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline Summary */}
        {stats.timeRange && (
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Activity Timeline
            </h3>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              From{" "}
              <strong>{stats.timeRange.earliest.toLocaleDateString()}</strong>{" "}
              to <strong>{stats.timeRange.latest.toLocaleDateString()}</strong>
            </div>
            <div
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Average:{" "}
              <strong>
                {(
                  stats.totalLogs /
                  Math.max(
                    1,
                    Math.ceil(
                      (stats.timeRange.latest.getTime() -
                        stats.timeRange.earliest.getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )
                ).toFixed(1)}{" "}
                activities per day
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
