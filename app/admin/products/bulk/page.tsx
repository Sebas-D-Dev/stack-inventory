"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { toast } from "react-hot-toast";

export default function BulkProductsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a CSV file to import");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/bulk/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to import products");
      }

      const data = await response.json();
      toast.success(`Successfully imported ${data.count} products`);
      router.refresh();
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("/api/products/bulk/export");
      if (!response.ok) {
        throw new Error("Failed to export products");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export products");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminHeader title="Bulk Product Management" />
      
      <div className="shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Import Products</h2>
        <p className="mb-4">
          Upload a CSV file to import multiple products at once. The CSV must include
          columns for name, sku, price, quantity, categoryId, and vendorId.
        </p>
        
        <form onSubmit={handleImport} className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={isUploading || !file}
            className="bg-blue-600 py-2 px-4 rounded-md
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Importing..." : "Import Products"}
          </button>
        </form>
      </div>

      <div className="shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Export Products</h2>
        <p className="mb-4">
          Download all products as a CSV file for backup or editing offline.
        </p>
        <button
          onClick={handleExport}
          disabled={isDownloading}
          className="bg-green-600 py-2 px-4 rounded-md
                   hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? "Generating CSV..." : "Export All Products"}
        </button>
      </div>
    </div>
  );
}
