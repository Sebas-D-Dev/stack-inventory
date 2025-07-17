import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import { canAccessAdminDashboard } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import OrderStatusBadge from "../OrderStatusBadge";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const resolvedParams = await params;

  // Check if user can access admin features
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminDashboard(session.user.role || "")) {
    redirect("/");
  }

  // Fetch the specific order with all details
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: resolvedParams.id },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          website: true,
        },
      },
      requestedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true,
              quantity: true,
              price: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          product: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "ORDERED":
        return "bg-indigo-100 text-indigo-800";
      case "PARTIALLY_RECEIVED":
        return "bg-orange-100 text-orange-800";
      case "RECEIVED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold mt-2"
              style={{ color: "var(--text-primary)" }}
            >
              Order #{order.id.slice(-8)}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <OrderStatusBadge
              status={order.status}
              className={getStatusColor(order.status)}
            />
            <Link
              href="/admin/orders"
              className="px-4 py-2 text-sm font-medium rounded-md border hover:opacity-80"
              style={{
                backgroundColor: "var(--button-secondary-background)",
                color: "var(--button-secondary-foreground)",
                borderColor: "var(--card-border)",
              }}
            >
              Back to Management
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Information */}
          <div
            className="p-6 rounded-lg"
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
              Order Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Total Amount
                </label>
                <div
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  ${order.totalAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Created Date
                </label>
                <div
                  className="text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              {order.orderDate && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Order Date
                  </label>
                  <div
                    className="text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(order.orderDate).toLocaleString()}
                  </div>
                </div>
              )}
              {order.expectedDate && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Expected Delivery
                  </label>
                  <div
                    className="text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(order.expectedDate).toLocaleString()}
                  </div>
                </div>
              )}
              {order.receivedDate && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Received Date
                  </label>
                  <div
                    className="text-lg"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(order.receivedDate).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="mt-4">
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Notes
                </label>
                <div
                  className="mt-1 p-3 rounded-md"
                  style={{
                    backgroundColor: "var(--background-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  {order.notes}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div
            className="p-6 rounded-lg"
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
              Order Items ({order.items.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: "var(--background-subtle)" }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-gray-200"
                  style={{ backgroundColor: "var(--card-background)" }}
                >
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <Link
                            href={`/admin/products/${item.product.id}`}
                            className="text-sm font-medium hover:underline"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.product.name}
                          </Link>
                          {item.product.category && (
                            <div
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {item.product.category.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-sm font-mono"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ${item.unitPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          ${item.totalPrice.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ backgroundColor: "var(--background-subtle)" }}>
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-3 text-right text-sm font-semibold"
                    >
                      Total Order Value:
                    </td>
                    <td className="px-6 py-3 text-sm font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vendor Information */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Vendor Information
            </h3>
            <div className="space-y-3">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Company
                </label>
                <div
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {order.vendor.name}
                </div>
              </div>
              {order.vendor.website && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Website
                  </label>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <a
                      href={order.vendor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {order.vendor.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* People Involved */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              People Involved
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Requested By
                </label>
                <div
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  {order.requestedBy.name}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {order.requestedBy.email} • {order.requestedBy.role}
                </div>
              </div>
              {order.approvedBy && (
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Approved By
                  </label>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {order.approvedBy.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {order.approvedBy.email}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href={`/admin/orders/${order.id}/edit`}
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Edit Order
              </Link>
              <Link
                href={`/admin/vendors/${order.vendor.id}`}
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Vendor Details
              </Link>
              <Link
                href="/admin/logs?entityType=PURCHASE_ORDER"
                className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Related Activity Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
