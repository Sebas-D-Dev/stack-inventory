import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

// Loading component for the dashboard
function DashboardLoading() {
  return (
    <div className="themed-loading-container">
      <div className="themed-spinner"></div>
      <p className="themed-loading-text">Loading dashboard data...</p>
    </div>
  );
}

export default async function Dashboard() {
  // Get inventory stats
  const [
    totalProducts,
    lowStockProducts,
    totalCategories,
    totalVendors,
    recentProducts,
  ] = await Promise.all([
    prisma.product.count(),
    // Count products with quantity <= 10 (fixed threshold)
    prisma.product.count({
      where: { quantity: { lte: 10 } },
    }),
    prisma.category.count(),
    prisma.vendor.count(),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        vendor: true,
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold themed-span-primary">
          Welcome back! 👋
        </h1>
        <p className="themed-span-secondary">
          Here&apos;s your inventory overview
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Create Actions */}
        <div className="flex flex-col gap-2">
          <h3
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Create New
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products/new"
              className="form-button py-2 px-4 flex items-center"
            >
              <span>Add Product</span>
            </Link>
            <Link
              href="/vendors/new"
              className="form-button py-2 px-4 flex items-center"
            >
              <span>Add Vendor</span>
            </Link>
            <Link
              href="/categories/new"
              className="form-button py-2 px-4 flex items-center"
            >
              <span>Add Category</span>
            </Link>
            <Link
              href="/inventory"
              className="form-button py-2 px-4 flex items-center"
            >
              <span>Edit Inventory</span>
            </Link>
          </div>
        </div>

        {/* View Actions */}
        <div className="flex flex-col gap-2">
          <h3
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            View Lists
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className="py-2 px-4 flex items-center rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
              }}
            >
              <span>View Products</span>
            </Link>
            <Link
              href="/vendors"
              className="py-2 px-4 flex items-center rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
              }}
            >
              <span>View Vendors</span>
            </Link>
            <Link
              href="/categories"
              className="py-2 px-4 flex items-center rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
              }}
            >
              <span>View Categories</span>
            </Link>
          </div>
        </div>

        {/* Data Management Actions */}
        <div className="flex flex-col gap-2">
          <h3
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Data Management
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/xml-integration"
              className="form-button py-2 px-4 flex items-center"
            >
              <span>XML Import/Export</span>
            </Link>
          </div>
        </div>
      </div>

      <Suspense fallback={<DashboardLoading />}>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Total Products
            </h3>
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
          </div>

          <div
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Low Stock Items
            </h3>
            <p className="text-3xl font-bold text-red-600">
              {lowStockProducts}
            </p>
          </div>

          <div
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Categories
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {totalCategories}
            </p>
          </div>

          <div
            className="p-6 rounded-lg shadow-sm"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Vendors
            </h3>
            <p className="text-3xl font-bold text-purple-600">{totalVendors}</p>
          </div>
        </div>
      </Suspense>

      {/* Recent Products */}
      <Suspense
        fallback={
          <div
            className="rounded-lg shadow-sm p-6"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <div className="themed-loading-container">
              <div className="themed-spinner"></div>
              <p className="themed-loading-text">Loading recent products...</p>
            </div>
          </div>
        }
      >
        <div
          className="rounded-lg shadow-sm"
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
              Recent Products
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table
              className="min-w-full"
              style={{
                backgroundColor: "var(--table-background)",
              }}
            >
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
                    Quantity
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Price
                  </th>
                </tr>
              </thead>
              <tbody
                style={{
                  borderColor: "var(--table-border)",
                  borderTopWidth: "1px",
                }}
              >
                {recentProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={{
                      borderColor: "var(--table-border)",
                      borderTopWidth: "1px",
                    }}
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      style={{ color: "var(--table-cell-foreground-strong)" }}
                    >
                      {product.name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--table-cell-foreground)" }}
                    >
                      {product.sku}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--table-cell-foreground)" }}
                    >
                      {product.category.name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--table-cell-foreground)" }}
                    >
                      <span
                        className={`${
                          product.quantity <= 10
                            ? "text-red-600 font-medium"
                            : ""
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      style={{ color: "var(--table-cell-foreground)" }}
                    >
                      ${product.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
