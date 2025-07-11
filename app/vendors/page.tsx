"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Vendor {
  id: string;
  name: string;
  website: string | null;
  _count?: {
    products: number;
  };
}

// Disable static generation
export const dynamic = "force-dynamic";

function VendorsList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/vendors`);
        if (!res.ok) {
          throw new Error("Failed to fetch vendors");
        }
        const data = await res.json();
        setVendors(data.vendors);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendors();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading vendors...</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">Vendors</h1>

          {vendors.length === 0 ? (
            <p className="text-center">No vendors available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold mb-2">{vendor.name}</h2>
                  {vendor.website && (
                    <p className="text-sm mb-2">
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {vendor.website}
                      </a>
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/products?vendor=${vendor.id}`}
                      className="text-blue-500 hover:underline"
                    >
                      View Products
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function VendorsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8">
      <Suspense
        fallback={
          <div className="themed-loading-container themed-loading-fullscreen">
            <div className="themed-spinner"></div>
            <p className="themed-loading-text">Loading page...</p>
          </div>
        }
      >
        <VendorsList />
      </Suspense>
    </div>
  );
}
