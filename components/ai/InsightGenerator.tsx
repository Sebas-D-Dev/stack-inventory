"use client";

import { useState } from "react";
import { useCompletion } from "ai/react";

type InsightType = "RECOMMENDATION" | "ANOMALY" | "TREND";
type EntityType = "PRODUCT" | "CATEGORY" | "VENDOR";

interface InsightGeneratorProps {
  entityId: string;
  entityType: EntityType;
  onSave?: (content: string) => void;
}

export default function InsightGenerator({
  entityId,
  entityType,
  onSave,
}: InsightGeneratorProps) {
  const [insightType, setInsightType] = useState<InsightType>("RECOMMENDATION");
  const [isSaving, setIsSaving] = useState(false);

  const { complete, completion, isLoading, error } = useCompletion({
    api: "/api/ai-insights",
    body: {
      entityId,
      entityType,
      insightType,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  const generateInsight = async () => {
    await complete(""); // The actual prompt is constructed on the server
  };

  const saveInsight = async () => {
    if (!completion) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/ai-insights/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityId,
          entityType,
          insightType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save insight");
      }

      const data = await response.json();
      if (onSave) {
        onSave(data.insight.content);
      }
    } catch (err) {
      console.error("Error saving insight:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <select
          className="rounded border p-2 text-sm"
          value={insightType}
          onChange={(e) => setInsightType(e.target.value as InsightType)}
          disabled={isLoading}
        >
          <option value="RECOMMENDATION">Recommendation</option>
          <option value="TREND">Trend Analysis</option>
          <option value="ANOMALY">Anomaly Detection</option>
        </select>

        <button
          onClick={generateInsight}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate Insight"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error.message || "Error generating insight"}
        </div>
      )}

      {completion && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-medium mb-2">AI Generated Insight:</h3>
            <div className="whitespace-pre-wrap">{completion}</div>
          </div>

          <button
            onClick={saveInsight}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Insight"}
          </button>
        </div>
      )}
    </div>
  );
}
