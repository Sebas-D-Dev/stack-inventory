import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import UserActions from "./UserActions";

export default async function AdminUserManagement() {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.isAdmin) {
    redirect("/");
  }

  // Fetch all users with admin status and account status
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      admins: true,
      _count: {
        select: {
          activityLogs: true,
          posts: true,
          products: true
        }
      }
    },
  });

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
              backgroundColor: "var(--button-accent)",
              color: "var(--button-accent-foreground)",
            }}
          >
            Add New User
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm" style={{ backgroundColor: "var(--card-background)" }}>
        <table className="min-w-full">
          <thead style={{ backgroundColor: "var(--table-header-background)" }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isAdmin = user.admins.length > 0;
              const isDisabled = user.isDisabled || false;
              
              return (
                <tr key={user.id} className={isDisabled ? "opacity-60" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                    {user.name || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                    <span className={`px-2 py-1 text-xs rounded-full ${isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                      {isAdmin ? "ADMIN" : "USER"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                    <span className={`px-2 py-1 text-xs rounded-full ${isDisabled ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      {isDisabled ? "DISABLED" : "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                    <div className="flex flex-col">
                      <span>{user._count.activityLogs} activities</span>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {user._count.posts} posts, {user._count.products} products
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <UserActions 
                      userId={user.id} 
                      isAdmin={isAdmin} 
                      isDisabled={isDisabled}
                      currentUserId={session.user.id}
                    />
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