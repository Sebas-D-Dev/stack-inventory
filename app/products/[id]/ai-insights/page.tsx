"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import InsightGenerator from "@/components/ai/InsightGenerator";

interface AIInsight {
  id: string;
  entityType: string;
  entityId: string;
  insightType: string;
  content: string;
  confidence: number;
  applied: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductAIInsights() {
  const params = useParams();
  const productId = params.id as string;
  const [savedInsights, setSavedInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/insights`);
        if (response.ok) {
          const data = await response.json();
          setSavedInsights(data.insights);
        }
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [productId]);

  const handleInsightSaved = () => {
    // Optionally refresh the insights list
    // For now, just show a success message
    alert("Insight saved successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href={`/products/${productId}`}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Back to Product
          </Link>
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          AI Insights
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Get intelligent recommendations and insights for this product
        </p>
      </div>

      <div
        className="p-6 rounded-lg shadow-sm mb-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Generate New Insight
        </h2>
        <InsightGenerator
          entityId={productId}
          entityType="PRODUCT"
          onSave={handleInsightSaved}
        />
      </div>

      <div
        className="p-6 rounded-lg shadow-sm"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Previous Insights
        </h2>

        {isLoading ? (
          <div className="themed-loading-container">
            <div className="themed-spinner"></div>
            <p className="themed-loading-text">Loading insights...</p>
          </div>
        ) : savedInsights.length > 0 ? (
          <div className="space-y-4">
            {savedInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded border"
                style={{
                  backgroundColor: "var(--table-header-background)",
                  borderColor: "var(--table-border)",
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {insight.insightType}
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {new Date(insight.createdAt).toLocaleString()}
                  </span>
                </div>
                <p
                  className="whitespace-pre-wrap"
                  style={{ color: "var(--text-primary)" }}
                >
                  {insight.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            No insights found for this product.
          </p>
        )}
      </div>
    </div>
  );
}
