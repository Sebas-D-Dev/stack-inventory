"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

interface XMLProcessingResults {
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  warnings: string[];
}

export default function XMLManager() {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] =
    useState<XMLProcessingResults | null>(null);
  const [exportOptions, setExportOptions] = useState({
    documentType: "INVENTORY_UPDATE",
    format: "download",
    categoryId: "",
    vendorId: "",
    includeLowStock: false,
  });

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/inventory/xml-import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResults(result.results);
      } else {
        console.error("Import failed:", result.error);
        alert(`Import failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error importing XML:", error);
      alert("Failed to import XML file");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);

    try {
      const params = new URLSearchParams({
        type: exportOptions.documentType,
        format: exportOptions.format,
      });

      if (exportOptions.categoryId) {
        params.append("categoryId", exportOptions.categoryId);
      }
      if (exportOptions.vendorId) {
        params.append("vendorId", exportOptions.vendorId);
      }

      const response = await fetch(`/api/inventory/xml-export?${params}`);

      if (response.ok) {
        if (exportOptions.format === "download") {
          // Handle file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `inventory_${exportOptions.documentType.toLowerCase()}_${
            new Date().toISOString().split("T")[0]
          }.xml`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // Handle inline response
          const result = await response.json();
          console.log("XML Content:", result.content);
          alert("Export completed successfully!");
        }
      } else {
        const error = await response.json();
        alert(`Export failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error exporting XML:", error);
      alert("Failed to export XML");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkExport = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/inventory/xml-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: exportOptions.documentType,
          includeLowStock: exportOptions.includeLowStock,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bulk_inventory_${
          new Date().toISOString().split("T")[0]
        }.xml`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`Bulk export failed: ${error.error}`);
      }
    } catch (error) {
      console.error("Error with bulk export:", error);
      alert("Failed to perform bulk export");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 rounded-lg my-8"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        XML Inventory Management
      </h1>

      <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
        Import and export inventory data in XML format for B2B integration and
        third-party system communication.
      </p>

      {/* Tab Navigation */}
      <div
        className="flex border-b mb-6"
        style={{ borderColor: "var(--card-border)" }}
      >
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "import"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("import")}
        >
          Import XML
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "export"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("export")}
        >
          Export XML
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === "import" && (
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Import Inventory Data
          </h2>

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center"
            style={{ borderColor: "var(--card-border)" }}
          >
            <Upload
              className="mx-auto h-12 w-12 mb-4"
              style={{ color: "var(--text-secondary)" }}
            />
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              Select an XML file to import inventory data, purchase orders, or
              stock updates.
            </p>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileImport}
              disabled={isProcessing}
              className="form-input"
            />
          </div>

          {isProcessing && (
            <div className="themed-loading-container">
              <div className="themed-spinner"></div>
              <p className="themed-loading-text">Processing XML file...</p>
            </div>
          )}

          {importResults && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--card-border)",
                borderWidth: "1px",
              }}
            >
              <h3
                className="font-semibold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Import Results
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResults.processed}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Processed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResults.created}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Created
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResults.updated}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Updated
                  </div>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {importResults.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importResults.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 mb-2">
                    Warnings:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {importResults.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-600">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--accent-background)",
              borderColor: "var(--accent-border)",
              borderWidth: "1px",
            }}
          >
            <h4
              className="font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Supported XML Document Types:
            </h4>
            <ul
              className="list-disc list-inside space-y-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>
                <strong>INVENTORY_UPDATE:</strong> Update existing product
                quantities and information
              </li>
              <li>
                <strong>STOCK_REPORT:</strong> Import complete inventory status
                from external systems
              </li>
              <li>
                <strong>PURCHASE_ORDER:</strong> Import purchase orders from
                suppliers or external systems
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Export Inventory Data
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="documentType" className="form-label">
                Document Type
              </label>
              <select
                id="documentType"
                value={exportOptions.documentType}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    documentType: e.target.value,
                  }))
                }
                className="form-select"
              >
                <option value="INVENTORY_UPDATE">Inventory Update</option>
                <option value="STOCK_REPORT">Stock Report</option>
                <option value="PURCHASE_ORDER">Purchase Orders</option>
              </select>
            </div>

            <div>
              <label htmlFor="format" className="form-label">
                Export Format
              </label>
              <select
                id="format"
                value={exportOptions.format}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    format: e.target.value,
                  }))
                }
                className="form-select"
              >
                <option value="download">Download File</option>
                <option value="inline">View in Browser</option>
              </select>
            </div>

            <div>
              <label htmlFor="categoryId" className="form-label">
                Filter by Category (Optional)
              </label>
              <input
                type="text"
                id="categoryId"
                value={exportOptions.categoryId}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    categoryId: e.target.value,
                  }))
                }
                className="form-input"
                placeholder="Category ID"
              />
            </div>

            <div>
              <label htmlFor="vendorId" className="form-label">
                Filter by Vendor (Optional)
              </label>
              <input
                type="text"
                id="vendorId"
                value={exportOptions.vendorId}
                onChange={(e) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    vendorId: e.target.value,
                  }))
                }
                className="form-input"
                placeholder="Vendor ID"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeLowStock"
              checked={exportOptions.includeLowStock}
              onChange={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  includeLowStock: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="includeLowStock" className="form-label">
              Include only low stock items (for bulk export)
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="form-button"
            >
              {isProcessing ? "Exporting..." : "Export XML"}
            </button>

            <button
              onClick={handleBulkExport}
              disabled={isProcessing}
              className="form-button-secondary"
            >
              {isProcessing ? "Exporting..." : "Bulk Export"}
            </button>
          </div>

          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: "var(--accent-background)",
              borderColor: "var(--accent-border)",
              borderWidth: "1px",
            }}
          >
            <h4
              className="font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              XML Integration Benefits:
            </h4>
            <ul
              className="list-disc list-inside space-y-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>
                <strong>B2B Communication:</strong> Exchange data with
                suppliers, customers, and partners
              </li>
              <li>
                <strong>System Integration:</strong> Connect with ERP, WMS, and
                other business systems
              </li>
              <li>
                <strong>Automation:</strong> Enable automated inventory updates
                and order processing
              </li>
              <li>
                <strong>Scalability:</strong> Support growing business needs and
                third-party integrations
              </li>
              <li>
                <strong>Standardization:</strong> Use industry-standard XML
                formats for data exchange
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
