import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { canAccessAdminDashboard } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderManagementActions from "./OrderManagementActions";
import OrderFilters from "./OrderFilters";
import { PurchaseStatus } from "@prisma/client";

interface SearchParams {
  status?: string;
  vendorId?: string;
  requesterId?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

interface AdminOrderManagementProps {
  searchParams: Promise<SearchParams>;
}

export default async function AdminOrderManagement({
  searchParams,
}: AdminOrderManagementProps) {
  const resolvedSearchParams = await searchParams;

  // Check if user can access admin features
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminDashboard(session.user.role || "")) {
    redirect("/");
  }

  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = parseInt(resolvedSearchParams.limit || "20");
  const offset = (page - 1) * limit;

  // Build where clause based on filters
  const whereClause: {
    status?: PurchaseStatus;
    vendorId?: string;
    requesterId?: string;
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  } = {};

  if (resolvedSearchParams.status) {
    whereClause.status = resolvedSearchParams.status as PurchaseStatus;
  }

  if (resolvedSearchParams.vendorId) {
    whereClause.vendorId = resolvedSearchParams.vendorId;
  }

  if (resolvedSearchParams.requesterId) {
    whereClause.requesterId = resolvedSearchParams.requesterId;
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

  // Fetch filtered orders and other data
  const [orders, totalCount, allVendors, allUsers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
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
                quantity: true,
              },
            },
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where: whereClause }),
    prisma.vendor.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Order Management
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage and track all purchase orders across the system
          </p>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters
        currentFilters={{
          status: resolvedSearchParams.status,
          vendorId: resolvedSearchParams.vendorId,
          requesterId: resolvedSearchParams.requesterId,
          startDate: resolvedSearchParams.startDate,
          endDate: resolvedSearchParams.endDate,
        }}
        vendors={allVendors}
        users={allUsers}
      />

      {/* Orders Table */}
      <div
        className="overflow-x-auto rounded-lg shadow-sm"
        style={{ backgroundColor: "var(--card-background)" }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: "var(--background-subtle)" }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Order Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className="divide-y divide-gray-200"
            style={{ backgroundColor: "var(--card-background)" }}
          >
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      #{order.id.slice(-8)}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.vendor.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {order.vendor.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {order.requestedBy.name}
                    </div>
                    <div
                      className="text-xs capitalize"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {order.requestedBy.role.toLowerCase()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusBadge
                    status={order.status}
                    className={getStatusColor(order.status)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${order.totalAmount.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {order._count.items} item
                    {order._count.items !== 1 ? "s" : ""}
                  </div>
                  {order.items.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="text-xs truncate max-w-32"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.product.name} (×{item.quantity})
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      +{order.items.length - 2} more...
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    {order.orderDate && (
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Ordered:{" "}
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    )}
                    {order.expectedDate && (
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Expected:{" "}
                        {new Date(order.expectedDate).toLocaleDateString()}
                      </div>
                    )}
                    {order.receivedDate && (
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Received:{" "}
                        {new Date(order.receivedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderManagementActions
                    order={order}
                    currentUserRole={session.user.role || ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <div
              className="text-lg font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              No purchase orders found
            </div>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Orders will appear here as they are created.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center space-x-2">
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
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Page {page} of {totalPages}
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
