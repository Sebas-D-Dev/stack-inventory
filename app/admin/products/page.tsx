import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { canAccessAdminDashboard } from "@/lib/permissions";

export default async function AdminProductManagement() {
  // Check if user has admin access
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminDashboard(session.user.role || "")) {
    redirect("/");
  }

  // Fetch products that need attention
  const productsNeedingAttention = await prisma.product.findMany({
    where: {
      OR: [
        { quantity: { lte: 0 } },
        { quantity: { lte: 10 } }, // Using fixed threshold of 10
      ],
    },
    include: {
      category: true,
      vendor: true,
    },
    orderBy: { quantity: "asc" },
  });

  // Temporary debug log
  console.log('First product:', productsNeedingAttention[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold themed-span-primary">
          Inventory Management
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <div className="flex flex-wrap gap-4">
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
            href="/products/new"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Add New Product
          </Link>
          <Link
            href="/admin/products/bulk"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Bulk Update
          </Link>
          <Link
            href="/admin/products/adjust-prices"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Adjust Prices
          </Link>
        </div>
      </div>

      <div className="mb-8">
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Products Needing Attention
        </h2>

        <div
          className="overflow-x-auto rounded-lg shadow-sm"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <table className="min-w-full">
            <thead
              style={{ backgroundColor: "var(--table-header-background)" }}
            >
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  SKU
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Category
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Vendor
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Quantity
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Threshold
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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {productsNeedingAttention.map((product: any) => (
                <tr key={product.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.name}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.sku}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.category?.name || 'No category'}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.vendor?.name || 'No vendor'}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span
                      className={
                        product.quantity <= 0
                          ? "text-red-600 font-bold"
                          : "text-orange-500 font-medium"
                      }
                    >
                      {product.quantity}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.minimumOrderQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Link
                      href={`/inventory?productId=${product.id}&adjustmentType=Purchase`}
                      className="px-3 py-1 rounded text-sm"
                      style={{
                        backgroundColor: "var(--success-light)",
                        color: "var(--success)",
                      }}
                    >
                      Restock
                    </Link>
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
