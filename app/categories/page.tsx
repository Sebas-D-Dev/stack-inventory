"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  products: {
    id: string;
    name: string;
  }[];
  _count?: {
    products: number;
  };
}

// Disable static generation
export const dynamic = "force-dynamic";

function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/categories`);
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await res.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading categories...</p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-8">Product Categories</h1>
          
          {categories.length === 0 ? (
            <p className="text-center">No categories available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
              {categories.map((category) => (
                <div key={category.id} className="border p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                  <p className="text-sm">
                    {category._count?.products || 0} products
                  </p>
                  <div className="mt-4">
                    <Link href={`/categories/${category.id}`} className="text-blue-500 hover:underline">
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

export default function CategoriesPage() {
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
        <CategoriesList />
      </Suspense>
    </div>
  );
}