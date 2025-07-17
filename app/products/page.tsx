"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: {
    id: string;
    name: string;
  };
  vendor: {
    id: string;
    name: string;
  };
}

interface FilterOptions {
  category: string;
  vendor: string;
  minPrice: string;
  maxPrice: string;
  minQuantity: string;
  maxQuantity: string;
}

// Disable static generation
export const dynamic = "force-dynamic";

function ProductsList() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialVendor = searchParams.get("vendor") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    category: initialCategory,
    vendor: initialVendor,
    minPrice: "",
    maxPrice: "",
    minQuantity: "",
    maxQuantity: "",
  });

  // Fetch products data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes, vendorsRes] = await Promise.all([
          fetch(`/api/products`),
          fetch("/api/categories"),
          fetch("/api/vendors"),
        ]);

        if (!productsRes.ok || !categoriesRes.ok || !vendorsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const vendorsData = await vendorsRes.json();

        setProducts(productsData.products);
        setFilteredProducts(productsData.products);
        setCategories(categoriesData.categories);
        setVendors(vendorsData.vendors);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...products];

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.sku.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(
        (product) => product.category.id === filters.category
      );
    }

    // Apply vendor filter
    if (filters.vendor) {
      result = result.filter((product) => product.vendor.id === filters.vendor);
    }

    // Apply price filters
    if (filters.minPrice) {
      result = result.filter(
        (product) => product.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (product) => product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Apply quantity filters
    if (filters.minQuantity) {
      result = result.filter(
        (product) => product.quantity >= parseInt(filters.minQuantity)
      );
    }
    if (filters.maxQuantity) {
      result = result.filter(
        (product) => product.quantity <= parseInt(filters.maxQuantity)
      );
    }

    setFilteredProducts(result);
  }, [products, searchTerm, filters]);

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "",
      vendor: "",
      minPrice: "",
      maxPrice: "",
      minQuantity: "",
      maxQuantity: "",
    });
    setSearchTerm("");
  };

  return (
    <>
      {isLoading ? (
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Page Title */}
          <div className="mb-6">
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Products
            </h1>
          </div>

          {/* Search and Add Product Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: "var(--input-background)",
                  borderColor: "var(--input-border)",
                  color: "var(--text-primary)",
                }}
              />
              <Search
                className="absolute left-3 top-2.5 h-5 w-5"
                style={{ color: "var(--text-secondary)" }}
              />
            </div>

            <Link
              href="/products/new"
              className="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              style={{
                backgroundColor: "var(--button-background)",
                color: "var(--button-foreground)",
              }}
            >
              Add New Product
            </Link>
          </div>

          {/* Filters Section */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--card-border)",
              borderWidth: "1px",
            }}
          >
            <h2
              className="font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Filters
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Vendor
                </label>
                <select
                  name="vendor"
                  value={filters.vendor}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Min Price
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Max Price
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Min Quantity
                </label>
                <input
                  type="number"
                  name="minQuantity"
                  value={filters.minQuantity}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Max Quantity
                </label>
                <input
                  type="number"
                  name="maxQuantity"
                  value={filters.maxQuantity}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full p-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--input-background)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="py-2 px-4 rounded-md"
                style={{
                  backgroundColor: "var(--button-secondary-background)",
                  color: "var(--button-secondary-foreground)",
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Table Section */}
          <div>
            {filteredProducts.length === 0 ? (
              <div
                className="text-center p-8 rounded-lg"
                style={{
                  backgroundColor: "var(--card-background)",
                  borderColor: "var(--card-border)",
                  borderWidth: "1px",
                  color: "var(--text-secondary)",
                }}
              >
                <p>No products match your search or filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 py-2 px-4 rounded-md"
                  style={{
                    backgroundColor: "var(--button-secondary-background)",
                    color: "var(--button-secondary-foreground)",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className="overflow-x-auto rounded-lg shadow-sm"
                style={{ backgroundColor: "var(--card-background)" }}
              >
                <table
                  className="min-w-full"
                  style={{
                    backgroundColor: "var(--table-background)",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "var(--table-header-background)",
                    }}
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
                        Price
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: "var(--table-header-foreground)" }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    style={{
                      borderColor: "var(--table-border)",
                      borderTopWidth: "1px",
                    }}
                  >
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        style={{
                          borderColor: "var(--table-border)",
                          borderTopWidth: "1px",
                        }}
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                          style={{
                            color: "var(--table-cell-foreground-strong)",
                          }}
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
                          {product.vendor.name}
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
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm"
                          style={{ color: "var(--table-cell-foreground)" }}
                        >
                          <Link
                            href={`/products/${product.id}`}
                            className="text-blue-500 hover:underline mr-3"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense
        fallback={
          <div className="themed-loading-container themed-loading-fullscreen">
            <div className="themed-spinner"></div>
            <p className="themed-loading-text">Loading page...</p>
          </div>
        }
      >
        <ProductsList />
      </Suspense>
    </div>
  );
}
