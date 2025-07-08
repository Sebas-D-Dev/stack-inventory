"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
      <h1 className="text-3xl font-bold mb-6">AI Insights</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate New Insight</h2>
        <InsightGenerator
          entityId={productId}
          entityType="PRODUCT"
          onSave={handleInsightSaved}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Previous Insights</h2>

        {isLoading ? (
          <p>Loading insights...</p>
        ) : savedInsights.length > 0 ? (
          <div className="space-y-4">
            {savedInsights.map((insight) => (
              <div key={insight.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">{insight.insightType}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(insight.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{insight.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No insights found for this product.</p>
        )}
      </div>
    </div>
  );
}
