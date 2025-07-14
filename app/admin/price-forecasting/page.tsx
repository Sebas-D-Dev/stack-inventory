"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  minimumOrderQuantity: number;
  category: { name: string };
  vendor: { name: string };
}

interface ExternalDeal {
  id: string;
  source: string;
  price: number;
  shipping: number;
  inStock: boolean;
  externalUrl: string;
  updatedAt: string;
}

interface PriceForecast {
  productId: string;
  predictedPrice: number;
  confidence: number;
  recommendedQuantity: number;
  bestDeal: ExternalDeal;
  savings: number;
}

export default function PriceForecastingPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [forecasts, setForecasts] = useState<PriceForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [forecastDays, setForecastDays] = useState(30);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!session?.user) {
      redirect("/");
    }
  }, [session]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePriceForecast = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/price-forecasting/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          days: forecastDays,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setForecasts((prev) => [
          ...prev.filter((f) => f.productId !== selectedProduct),
          data.forecast,
        ]);
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBulkForecasts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/price-forecasting/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: forecastDays }),
      });

      if (response.ok) {
        const data = await response.json();
        setForecasts(data.forecasts);
      }
    } catch (error) {
      console.error("Error generating bulk forecasts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Price Forecasting & Deal Analysis
        </h1>
      </div>

      {/* Controls */}
      <div
        className="p-6 rounded-lg mb-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Select Product
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2 rounded-md border"
              style={{
                backgroundColor: "var(--input-background)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            >
              <option value="">Choose a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Forecast Period (Days)
            </label>
            <input
              type="number"
              value={forecastDays}
              onChange={(e) => setForecastDays(parseInt(e.target.value))}
              min="7"
              max="365"
              className="w-full p-2 rounded-md border"
              style={{
                backgroundColor: "var(--input-background)",
                borderColor: "var(--input-border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={generatePriceForecast}
              disabled={!selectedProduct || isLoading}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? "Analyzing..." : "Analyze Product"}
            </button>
            <button
              onClick={generateBulkForecasts}
              disabled={isLoading}
              className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              Analyze All
            </button>
          </div>
        </div>
      </div>

      {/* Forecasts Results */}
      {forecasts.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--card-border)",
            borderWidth: "1px",
          }}
        >
          <div
            className="px-6 py-4"
            style={{ backgroundColor: "var(--table-header-background)" }}
          >
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Price Forecasting Results
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead
                style={{ backgroundColor: "var(--table-header-background)" }}
              >
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Product
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Current Price
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Best Deal
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Predicted Price
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Recommended Qty
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase"
                    style={{ color: "var(--table-header-foreground)" }}
                  >
                    Potential Savings
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
                {forecasts.map((forecast) => {
                  const product = products.find(
                    (p) => p.id === forecast.productId
                  );
                  return (
                    <tr
                      key={forecast.productId}
                      style={{ borderColor: "var(--table-border)" }}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        <div>
                          <div className="font-medium">{product?.name}</div>
                          <div className="text-gray-500">{product?.sku}</div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        ${product?.price.toFixed(2)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        <div>
                          <div className="font-medium">
                            $
                            {(
                              forecast.bestDeal.price +
                              forecast.bestDeal.shipping
                            ).toFixed(2)}
                          </div>
                          <div className="text-gray-500">
                            {forecast.bestDeal.source}
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        <div>
                          <div className="font-medium">
                            ${forecast.predictedPrice.toFixed(2)}
                          </div>
                          <div className="text-gray-500">
                            {(forecast.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--table-cell-foreground)" }}
                      >
                        {forecast.recommendedQuantity} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            forecast.savings > 0
                              ? "text-green-600 font-medium"
                              : "text-red-600"
                          }
                        >
                          ${Math.abs(forecast.savings).toFixed(2)}
                          {forecast.savings > 0 ? " saved" : " extra"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <a
                          href={forecast.bestDeal.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded text-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                          View Deal
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
