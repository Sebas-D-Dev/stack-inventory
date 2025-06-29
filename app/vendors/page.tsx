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
        <div className="flex items-center justify-center space-x-2 min-h-[200px]">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">Vendors</h1>
          
          {vendors.length === 0 ? (
            <p className="text-gray-600 text-center">No vendors available.</p>
          ) : (
            <div className="space-y-6 w-full max-w-4xl mx-auto">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="border p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{vendor.name}</h2>
                  {vendor.website && (
                    <p className="text-sm text-gray-500 mb-2">
                      Website: <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{vendor.website}</a>
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {vendor._count?.products || 0} products
                  </p>
                  <div className="mt-4">
                    <Link href={`/vendors/${vendor.id}`} className="text-blue-500 hover:underline">
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Loading page...</p>
          </div>
        }
      >
        <VendorsList />
      </Suspense>
    </div>
  );
}