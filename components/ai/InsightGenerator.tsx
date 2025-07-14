"use client";

import { useState, useEffect, useCallback } from "react";

// Define proper type for groundingData
interface GroundingData {
  webSearchQueries?: string[];
  // Add other fields as needed
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const [groundingData, setGroundingData] = useState<GroundingData | null>(
    null
  );
  const [currentInsight, setCurrentInsight] = useState<string>("");

  // Check API availability on mount
  useEffect(() => {
    async function checkApiStatus() {
      try {
        setErrorMessage(null);
        const response = await fetch("/api/ai-insights/status");
        if (!response.ok) {
          const data = await response.json();
          setIsApiAvailable(false);
          setApiErrorDetails(data.error || "API not available");
        } else {
          setIsApiAvailable(true);
          setApiErrorDetails(null);
        }
      } catch (error) {
        console.error("Error checking API status:", error);
        setIsApiAvailable(false);
        setApiErrorDetails("Could not reach the AI service");
      }
    }

    checkApiStatus();
  }, []);

  // Determine if a generation is in progress
  const isGenerating = isLoading;

  const generateInsight = useCallback(async () => {
    setErrorMessage(null);
    setGroundingData(null);
    setCurrentInsight("");
    setIsLoading(true);

    // Skip API call if we already know it's not available
    if (!isApiAvailable) {
      setErrorMessage(`AI service is unavailable: ${apiErrorDetails}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ai-insights", {
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
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setCurrentInsight(data.insight);
    } catch (err) {
      console.error("Error during insight generation:", err);
      setErrorMessage(
        err instanceof Error
          ? `${err.message} (${err.name})`
          : "Failed to generate insight. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isApiAvailable, apiErrorDetails, entityId, entityType, insightType]);

  const saveInsight = async () => {
    if (!currentInsight) return;

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
          content: currentInsight,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save insight");
      }

      const data = await response.json();
      if (onSave) {
        onSave(data.insight.content);
      }
    } catch (err) {
      console.error("Error saving insight:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save insight"
      );
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
          disabled={isGenerating || !isApiAvailable}
        >
          <option value="RECOMMENDATION">Recommendation</option>
          <option value="TREND">Trend Analysis</option>
          <option value="ANOMALY">Anomaly Detection</option>
        </select>

        <button
          onClick={generateInsight}
          disabled={isGenerating || !isApiAvailable}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate Insight"}
        </button>
      </div>

      {!isApiAvailable && (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
          AI service is currently unavailable. Reason: {apiErrorDetails}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p className="font-medium">Error generating insight:</p>
          <p>{errorMessage}</p>
          <p className="mt-2 text-sm text-red-600">
            If this persists, please check your API configuration or try again
            later.
          </p>
        </div>
      )}

      {isGenerating && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded">
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-3"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Generating insight with Gemini AI...</span>
          </div>
        </div>
      )}

      {groundingData && (
        <div className="p-4 bg-green-50 text-green-800 rounded text-sm border border-green-200 mb-2">
          <p className="font-medium mb-1">Using real-time data for insights</p>
          {groundingData.webSearchQueries && (
            <p>Search queries: {groundingData.webSearchQueries.join(", ")}</p>
          )}
        </div>
      )}

      {currentInsight && (
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded border">
            <h3 className="font-medium mb-2">AI Generated Insight:</h3>
            <div className="whitespace-pre-wrap">{currentInsight}</div>
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
