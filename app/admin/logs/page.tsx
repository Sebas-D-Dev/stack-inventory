import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { canViewUserActivity } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import ActivityLogFilters from "./ActivityLogFilters";
import ActivityLogEntry from "./ActivityLogEntry";
import ActivityLogInsights from "./ActivityLogInsights";
import { Suspense } from "react";

interface SearchParams {
  action?: string;
  entityType?: string;
  userId?: string;
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
}

interface ActivityLogsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ActivityLogsPage({
  searchParams,
}: ActivityLogsPageProps) {
  const resolvedSearchParams = await searchParams;
  // Check if user can view activity logs
  const session = await getServerSession(authOptions);
  if (!session?.user || !canViewUserActivity(session.user.role || "")) {
    redirect("/");
  }

  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = parseInt(resolvedSearchParams.limit || "50");
  const offset = (page - 1) * limit;

  // Build where clause based on filters
  const whereClause: {
    action?: string;
    entityType?: string;
    userId?: string;
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  } = {};

  if (resolvedSearchParams.action) {
    whereClause.action = resolvedSearchParams.action;
  }

  if (resolvedSearchParams.entityType) {
    whereClause.entityType = resolvedSearchParams.entityType;
  }

  if (resolvedSearchParams.userId) {
    whereClause.userId = resolvedSearchParams.userId;
  }

  if (resolvedSearchParams.startDate || resolvedSearchParams.endDate) {
    whereClause.createdAt = {};
    if (resolvedSearchParams.startDate) {
      whereClause.createdAt.gte = new Date(resolvedSearchParams.startDate);
    }
    if (resolvedSearchParams.endDate) {
      whereClause.createdAt.lte = new Date(resolvedSearchParams.endDate);
    }
  }

  // Fetch activity logs with pagination and insights data
  const [
    logs,
    totalCount,
    uniqueActions,
    uniqueEntityTypes,
    allUsers,
    topActions,
    topUsers,
  ] = await Promise.all([
    prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.activityLog.count({ where: whereClause }),
    prisma.activityLog.findMany({
      select: { action: true },
      distinct: ["action"],
      orderBy: { action: "asc" },
    }),
    prisma.activityLog.findMany({
      select: { entityType: true },
      distinct: ["entityType"],
      orderBy: { entityType: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    }),
    // Fetch top actions for insights
    prisma.activityLog.groupBy({
      by: ["action"],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 15,
      where: whereClause,
    }),
    // Fetch top users for insights
    prisma.activityLog.groupBy({
      by: ["userId"],
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: "desc",
        },
      },
      take: 15,
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Calculate activity statistics
  const activityStats = {
    totalLogs: totalCount,
    uniqueUsers: new Set(logs.map((log) => log.userId)).size,
    timeRange:
      logs.length > 0
        ? {
            earliest: new Date(
              Math.min(...logs.map((log) => log.createdAt.getTime()))
            ),
            latest: new Date(
              Math.max(...logs.map((log) => log.createdAt.getTime()))
            ),
          }
        : null,
  };

  // Process insights data
  type TopAction = { action: string; _count: { action: number } };
  type TopUser = { userId: string; _count: { userId: number } };

  const processedTopActions = (topActions as TopAction[]).map((action) => ({
    action: action.action,
    count: action._count.action,
  }));

  const usersMap = new Map(allUsers.map((user) => [user.id, user]));
  const processedTopUsers = (topUsers as TopUser[])
    .map((userStat) => {
      const user = usersMap.get(userStat.userId);
      return user
        ? {
            user,
            count: userStat._count.userId,
          }
        : null;
    })
    .filter(Boolean) as Array<{
    user: { name: string | null; email: string; role: string };
    count: number;
  }>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Activity Logs
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Monitor and track all system activities
          </p>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {totalCount.toLocaleString()}
          </div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Total Activities
          </div>
        </div>
      </div>

      {/* Activity Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          className="p-6 rounded-lg"
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
            {activityStats.totalLogs.toLocaleString()}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Total Activity Logs
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
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
            {activityStats.uniqueUsers}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Active Users (in filtered results)
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
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
            {uniqueActions.length}
          </div>
          <div
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Unique Action Types
          </div>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div>Loading filters...</div>}>
        <ActivityLogFilters
          uniqueActions={uniqueActions}
          uniqueEntityTypes={uniqueEntityTypes}
          allUsers={allUsers}
          currentFilters={resolvedSearchParams}
        />
      </Suspense>

      {/* Activity Insights */}
      <div className="mt-8">
        <ActivityLogInsights
          stats={activityStats}
          topActions={processedTopActions}
          topUsers={processedTopUsers}
        />
      </div>

      {/* Activity Logs Table */}
      <div
        className="mt-8 overflow-x-auto rounded-lg shadow-sm"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: "var(--background-subtle)" }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody
            className="divide-y divide-gray-200"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            {logs.map((log) => (
              <ActivityLogEntry key={log.id} log={log} />
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <div
              className="text-lg font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              No activity logs found
            </div>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of{" "}
            {totalCount} results
          </div>
          <div className="flex space-x-2">
            {page > 1 && (
              <a
                href={`?${new URLSearchParams({
                  ...resolvedSearchParams,
                  page: (page - 1).toString(),
                }).toString()}`}
                className="px-3 py-2 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: "var(--button-secondary-background)",
                  color: "var(--button-secondary-foreground)",
                }}
              >
                Previous
              </a>
            )}

            <span
              className="px-3 py-2 rounded-md text-sm font-medium"
              style={{
                backgroundColor: "var(--button-primary-background)",
                color: "var(--button-primary-foreground)",
              }}
            >
              {page} of {totalPages}
            </span>

            {page < totalPages && (
              <a
                href={`?${new URLSearchParams({
                  ...resolvedSearchParams,
                  page: (page + 1).toString(),
                }).toString()}`}
                className="px-3 py-2 rounded-md text-sm font-medium"
                style={{
                  backgroundColor: "var(--button-secondary-background)",
                  color: "var(--button-secondary-foreground)",
                }}
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
