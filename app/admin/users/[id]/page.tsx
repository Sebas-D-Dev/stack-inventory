import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { canManageUsers } from "@/lib/permissions";
import UserInfoForm from "./UserInfoForm";

export default async function UserInfoPage({
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

  // Fetch user details with additional information
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          activityLogs: true,
          posts: true,
          products: true,
          comments: true,
        },
      },
      posts: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
        },
      },
      products: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          createdAt: true,
        },
      },
      activityLogs: {
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          action: true,
          entityType: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/admin/users");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold themed-span-primary">
            User Information
          </h1>
          <p className="themed-span-secondary">
            Detailed information for {user.name || user.email}
          </p>
        </div>
        <div className="flex gap-4">
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
          <Link
            href={`/admin/users/${userId}/activity`}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            View Activity Log
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details and Actions */}
        <div className="lg:col-span-1">
          <div
            className="rounded-lg shadow-sm p-6 mb-6"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              User Details
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Name
                </label>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {user.name || "Not provided"}
                </p>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Email
                </label>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {user.email}
                </p>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Account Created
                </label>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Last Updated
                </label>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* User Management Form */}
          <UserInfoForm user={user} currentUserId={session.user.id} />
        </div>

        {/* Activity Overview */}
        <div className="lg:col-span-2">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <div className="text-2xl font-bold text-blue-600">
                {user._count.activityLogs}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Activities
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
              <div className="text-2xl font-bold text-green-600">
                {user._count.posts}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Posts
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
              <div className="text-2xl font-bold text-purple-600">
                {user._count.products}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Products
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
              <div className="text-2xl font-bold text-orange-600">
                {user._count.comments}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Comments
              </div>
            </div>
          </div>

          {/* Recent Posts */}
          {user.posts.length > 0 && (
            <div
              className="rounded-lg shadow-sm p-6 mb-6"
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
                Recent Posts
              </h3>
              <div className="space-y-3">
                {user.posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {post.title}
                      </Link>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Products */}
          {user.products.length > 0 && (
            <div
              className="rounded-lg shadow-sm p-6 mb-6"
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
                Recent Products
              </h3>
              <div className="space-y-3">
                {user.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <Link
                        href={`/products/${product.id}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {product.name}
                      </Link>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        SKU: {product.sku} • Created:{" "}
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.quantity > 10
                          ? "bg-green-100 text-green-800"
                          : product.quantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      Qty: {product.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div
            className="rounded-lg shadow-sm p-6"
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
              Recent Activity
            </h3>
            <div className="space-y-3">
              {user.activityLogs.map((log, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {log.action.replace(/_/g, " ")}
                    </span>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {log.entityType} •{" "}
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {user.activityLogs.length === 0 && (
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
