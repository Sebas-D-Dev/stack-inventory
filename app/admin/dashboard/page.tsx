import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { cardVariants, textVariants } from "@/lib/ui-variants";

import { canAccessAdminDashboard } from "@/lib/permissions";

export default async function AdminDashboard() {
  // Check if user has admin access
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminDashboard(session.user.role || "")) {
    redirect("/");
  }

  // Fetch admin dashboard statistics
  const [totalUsers, totalProducts, totalOrders, recentActivityLogs] =
    await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.purchaseOrder.count(),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className={cn(textVariants({ variant: "h1" }))}>Admin Dashboard</h1>
        <p className={cn(textVariants({ variant: "muted" }))}>
          Manage your system from a single place
        </p>
      </div>

      {/* Admin Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/users"
          className={cn(
            cardVariants({ variant: "default" }),
            "hover:shadow-md transition-shadow block"
          )}
        >
          <h3 className={cn(textVariants({ variant: "h3" }), "mb-2")}>
            User Management
          </h3>
          <p className={cn(textVariants({ variant: "muted" }))}>
            Manage users, roles, and permissions
          </p>
          <p className="mt-4 text-3xl font-bold text-blue-600">{totalUsers}</p>
        </Link>

        <Link
          href="/admin/posts/history"
          className={cn(
            cardVariants({ variant: "default" }),
            "hover:shadow-md transition-shadow block"
          )}
        >
          <h3 className={cn(textVariants({ variant: "h3" }), "mb-2")}>
            Post History
          </h3>
          <p className={cn(textVariants({ variant: "muted" }))}>
            View all content change history
          </p>
        </Link>

        <Link
          href="/admin/products"
          className={cn(
            cardVariants({ variant: "default" }),
            "hover:shadow-md transition-shadow block"
          )}
        >
          <h3 className={cn(textVariants({ variant: "h3" }), "mb-2")}>
            Inventory Management
          </h3>
          <p className={cn(textVariants({ variant: "muted" }))}>
            Bulk edit products and approvals
          </p>
          <p className="mt-4 text-3xl font-bold text-green-600">
            {totalProducts}
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <h3 className="text-xl font-medium mb-2 themed-span-primary">
            Order Management
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage and approve purchase orders
          </p>
          <p className="mt-4 text-3xl font-bold text-purple-600">
            {totalOrders}
          </p>
        </Link>

        <Link
          href="/admin/system"
          className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <h3 className="text-xl font-medium mb-2 themed-span-primary">
            System Settings
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Configure system-wide settings
          </p>
        </Link>

        <Link
          href="/admin/logs"
          className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <h3 className="text-xl font-medium mb-2 themed-span-primary">
            Activity Logs
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            System-wide audit logs
          </p>
        </Link>

        <Link
          href="/admin/moderation"
          className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <h3 className="text-xl font-medium mb-2 themed-span-primary">
            Content Moderation
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Review and approve user-generated content
          </p>
        </Link>

        <Link
          href="/admin/price-forecasting"
          className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <h3 className="text-xl font-medium mb-2 themed-span-primary">
            Price Forecasting
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Analyze and forecast product pricing
          </p>
        </Link>

        <Link
          href="/inventory-assistant"
          className="p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <h3 className="text-xl font-medium mb-2 themed-span-primary">
            AI Inventory Assistant
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Chat with AI about inventory management (Available to all users)
          </p>
        </Link>
      </div>

      {/* Recent Activity Logs */}
      <div
        className="rounded-lg shadow-sm mb-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div
          className="px-6 py-4"
          style={{
            borderColor: "var(--card-border)",
            borderBottomWidth: "1px",
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent System Activity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead
              style={{ backgroundColor: "var(--table-header-background)" }}
            >
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Time
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  User
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Action
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Entity
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivityLogs.map((log) => (
                <tr key={log.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {log.user.name}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {log.action}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {log.entityType}: {log.entityId.substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
