import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { canManageUsers } from "@/lib/permissions";

export default async function AdminUserManagement() {
  // Check if user can manage users
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageUsers(session.user.role || "")) {
    redirect("/");
  }

  // Fetch all users with their roles
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isDisabled: true,
      createdAt: true,
      _count: {
        select: {
          activityLogs: true,
          posts: true,
          products: true,
        },
      },
    },
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "MODERATOR":
        return "Moderator";
      case "VENDOR":
        return "Vendor";
      case "USER":
        return "User";
      default:
        return role;
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold themed-span-primary">
          User Management
        </h1>
        <div className="flex gap-4">
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Back to Admin Dashboard
          </Link>
          <Link
            href="/users/new"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Add New User
          </Link>
        </div>
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
                User
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Role
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Activity
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Joined
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase"
                style={{ color: "var(--table-header-foreground)" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isDisabled = user.isDisabled || false;

              return (
                <tr key={user.id} className={isDisabled ? "opacity-60" : ""}>
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {user.name || "—"}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        isDisabled
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <div className="flex flex-col">
                      <span>{user._count.activityLogs} activities</span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {user._count.posts} posts • {user._count.products}{" "}
                        products
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        View Info
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/activity`}
                        className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                      >
                        Activity
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
