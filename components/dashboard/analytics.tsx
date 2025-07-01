"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type ChartData = {
  name: string;
  value: number;
  color: string;
};

export default function AnalyticsCard({ title }: { title: string }) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        let endpoint = "";

        // Determine which endpoint to call based on the title
        if (title === "Product Categories") {
          endpoint = "/api/analytics/categories";
        } else if (title === "Inventory Value") {
          endpoint = "/api/analytics/inventory-value";
        } else if (title === "Low Stock Items") {
          endpoint = "/api/analytics/low-stock";
        }

        if (!endpoint) {
          setError("Invalid chart type");
          setIsLoading(false);
          return;
        }

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        // Transform the data for the chart
        const chartData = result.data.map(
          (item: { name: string; value: number }, index: number) => ({
            name: item.name,
            value: item.value,
            color: getColor(index),
          })
        );

        setData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setError("Failed to load chart data");
        setIsLoading(false);
      }
    }

    fetchData();
  }, [title]);

  // Generate a color based on index
  function getColor(index: number) {
    const colors = [
      "#4299e1", // blue-500
      "#48bb78", // green-500
      "#ed8936", // orange-500
      "#9f7aea", // purple-500
      "#f56565", // red-500
      "#38b2ac", // teal-500
      "#667eea", // indigo-500
      "#d53f8c", // pink-500
    ];

    return colors[index % colors.length];
  }

  return (
    <div
      className="p-6 rounded-lg shadow-sm"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
      }}
    >
      <h3
        className="text-lg font-medium mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>

      <div className="h-64">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="themed-spinner"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "var(--error)" }}>{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: "var(--text-secondary)" }}>No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value) => [`${value}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
