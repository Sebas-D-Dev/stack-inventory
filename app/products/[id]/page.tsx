export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      where: { id: id }, // Use the string ID here too
    });

    redirect("/products");
  }

  // Format dates nicely
  const createdAt = new Date(product.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine if stock is low
  const isLowStock = product.quantity <= product.reorderThreshold;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <article
        className="max-w-3xl w-full shadow-lg rounded-lg p-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        {/* Product Title and SKU */}
        <h1
          className="text-4xl font-extrabold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {product.name}
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          SKU: {product.sku}
        </p>

        {/* Product Information */}
        <div className="flex justify-between flex-wrap mb-6">
          <div style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--text-primary)" }}>Price:</span> $
            {product.price.toFixed(2)}
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--text-primary)" }}>Category:</span>{" "}
            {product.category.name}
          </div>
          <div style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--text-primary)" }}>Vendor:</span>{" "}
            {product.vendor.name}
          </div>
        </div>

        {/* Inventory Status */}
        <div
          className="mb-6 p-4 rounded-lg"
          style={{
            backgroundColor: isLowStock
              ? "rgba(239, 68, 68, 0.1)"
              : "var(--table-header-background)",
            borderColor: isLowStock ? "var(--error)" : "var(--table-border)",
            borderWidth: "1px",
          }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{
              color: isLowStock ? "var(--error)" : "var(--text-primary)",
            }}
          >
            Inventory Status {isLowStock && "(Low Stock)"}
          </h2>
          <div className="flex justify-between">
            <div>
              <span style={{ color: "var(--text-secondary)" }}>
                Current Quantity:
              </span>{" "}
              <span
                className={isLowStock ? "font-bold" : ""}
                style={{
                  color: isLowStock ? "var(--error)" : "var(--text-primary)",
                }}
              >
                {product.quantity}
              </span>
            </div>
            <div>
              <span style={{ color: "var(--text-secondary)" }}>
                Reorder Threshold:
              </span>{" "}
              <span style={{ color: "var(--text-primary)" }}>
                {product.reorderThreshold}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          Added by {product.user ? product.user.name : "Unknown"} on {createdAt}
        </div>
      </article>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <Link
          href="/products"
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--button-background)",
            color: "var(--button-foreground)",
          }}
        >
          Back to Products
        </Link>

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

        <form action={deleteProduct}>
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
            Delete Product
          </button>
        </form>
      </div>
    </div>
  );
}
