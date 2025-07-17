"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import { textVariants } from "@/lib/ui-variants";

interface Guideline {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

interface GuidelinesWidgetProps {
  trigger?: React.ReactNode;
  className?: string;
}

export default function GuidelinesWidget({
  trigger,
  className,
}: GuidelinesWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && guidelines.length === 0) {
      fetchGuidelines();
    }
  }, [isOpen, guidelines.length]);

  async function fetchGuidelines() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/guidelines");
      if (response.ok) {
        const data = await response.json();
        setGuidelines(data.filter((g: Guideline) => g.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch guidelines:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const defaultTrigger = (
    <button
      onClick={() => setIsOpen(true)}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "relative"
      )}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Community Guidelines
    </button>
  );

  return (
    <div className={cn("relative", className)}>
      <div onClick={() => setIsOpen(true)}>{trigger || defaultTrigger}</div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg shadow-xl",
                "w-full max-w-2xl max-h-[80vh] flex flex-col",
                "border border-gray-200 dark:border-gray-700"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className={cn(textVariants({ variant: "h3" }))}>
                    Community Guidelines
                  </h2>
                  <p className={cn(textVariants({ variant: "muted" }))}>
                    Please review these guidelines before posting
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : guidelines.length === 0 ? (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p
                      className={cn(textVariants({ variant: "muted" }), "mt-4")}
                    >
                      No guidelines have been set up yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guidelines.map((guideline, index) => (
                      <div
                        key={guideline.id}
                        className={cn(
                          "p-4 rounded-lg border border-gray-200 dark:border-gray-700",
                          "bg-gray-50/50 dark:bg-gray-800/50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={cn(
                                textVariants({ variant: "h3" }),
                                "mb-2 text-base font-semibold"
                              )}
                            >
                              {guideline.title}
                            </h3>
                            <div
                              className={cn(
                                textVariants({ variant: "body" }),
                                "whitespace-pre-line leading-relaxed"
                              )}
                              style={{ lineHeight: "1.6" }}
                            >
                              {guideline.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className={cn(buttonVariants({ variant: "default" }))}
                  >
                    I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
