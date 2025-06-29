export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Form from "next/form";

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch the product with relations
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      vendor: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Server action to delete the product
  async function deleteProduct() {
    "use server";

    await prisma.product.delete({
      where: { id },
    });

    redirect("/products");
  }

  // Format dates nicely
  const createdAt = new Date(product.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const updatedAt = new Date(product.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine if stock is low
  const isLowStock = product.quantity <= product.reorderThreshold;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/products"
          className="text-sm font-medium transition-colors"
          style={{ color: "var(--text-link)" }}
        >
          ← Back to Products
        </Link>

        <div className="flex space-x-3">
          <Link
            href={`/products/${id}/edit`}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Edit Product
          </Link>

          <Form action={deleteProduct}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--error)",
                color: "white",
              }}
              onClick={(e) => {
                if (!confirm("Are you sure you want to delete this product?")) {
                  e.preventDefault();
                }
              }}
            >
              Delete
            </button>
          </Form>
        </div>
      </div>

      <div
        className="rounded-lg shadow-sm mb-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            SKU: {product.sku}
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Product Details
            </h2>

            <div className="space-y-3">
              <div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Category:
                </span>
                <p style={{ color: "var(--text-primary)" }}>
                  {product.category.name}
                </p>
              </div>

              <div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Vendor:
                </span>
                <p style={{ color: "var(--text-primary)" }}>
                  {product.vendor.name}
                </p>
              </div>

              <div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Price:
                </span>
                <p style={{ color: "var(--text-primary)" }}>
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Inventory Status
            </h2>

            <div className="space-y-3">
              <div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Current Quantity:
                </span>
                <p
                  className={isLowStock ? "text-red-600 font-bold" : ""}
                  style={!isLowStock ? { color: "var(--text-primary)" } : {}}
                >
                  {product.quantity} {isLowStock && "(Low Stock)"}
                </p>
              </div>

              <div>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reorder Threshold:
                </span>
                <p style={{ color: "var(--text-primary)" }}>
                  {product.reorderThreshold}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-6 py-4 bg-opacity-50"
          style={{
            backgroundColor: "var(--table-header-background)",
            borderTop: "1px solid",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="flex flex-wrap justify-between text-xs">
            <div style={{ color: "var(--text-muted)" }}>
              Added by: {product.user ? product.user.name : "Unknown"} on{" "}
              {createdAt}
            </div>
            <div style={{ color: "var(--text-muted)" }}>
              Last updated: {updatedAt}
            </div>
          </div>
        </div>
      </div>

      {isLowStock && (
        <div
          className="rounded-lg p-4 mb-8"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "var(--error)",
            borderWidth: "1px",
          }}
        >
          <h3 className="font-medium mb-2" style={{ color: "var(--error)" }}>
            Low Stock Alert
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            This product is below the reorder threshold. Consider ordering more
            stock soon.
          </p>
        </div>
      )}
    </div>
  );
}
