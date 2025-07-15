import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { canManageUsers } from "@/lib/permissions";

export default async function UserActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check if user can manage users
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageUsers(session.user.role || "")) {
    redirect("/");
  }

  const userId = (await params).id;

  // Fetch user details and activity logs
  const [user, activityLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  if (!user) {
    redirect("/admin/users");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold themed-span-primary">
            User Activity Log
          </h1>
          <p className="themed-span-secondary">
            Activity for {user.name || user.email}
          </p>
        </div>
        <Link
          href="/admin/users"
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--button-background)",
            color: "var(--button-foreground)",
          }}
        >
          Back to User Management
        </Link>
      </div>

      <div
        className="overflow-x-auto rounded-lg shadow-sm"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <table className="min-w-full">
          <thead style={{ backgroundColor: "var(--table-header-background)" }}>
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Date & Time
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
                Entity Type
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Entity ID
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
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
                    {log.action}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {log.entityType}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span className="font-mono">
                      {log.entityId.substring(0, 8)}...
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-sm max-w-xs truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {log.details
                      ? JSON.parse(log.details).action || log.details
                      : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No activity logs found for this user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
