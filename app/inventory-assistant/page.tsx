"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import InventoryAssistant from "@/components/ai/InventoryAssistant";

export default function InventoryAssistantPage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) {
      redirect("/login");
    }
  }, [session]);

  const userRole = session?.user?.role || "USER";

  // Role-specific example questions
  const getExampleQuestions = (role: string) => {
    const baseQuestions = [
      "How many products are available in the system?",
      "Can you help me find information about a specific product?",
      "What categories of products do we have?",
    ];

    const vendorQuestions = [
      "How are my products performing?",
      "Which of my products need restocking?",
      "What's the current inventory level of my products?",
    ];

    const adminQuestions = [
      "Which products are running low on stock?",
      "What's the total value of our current inventory?",
      "Are there any good deals available for products we need to restock?",
      "What were the most recent inventory movements?",
      "Which category has the most products?",
    ];

    const moderatorQuestions = [
      "How many items are pending content review?",
      "Are there any posts that need moderation?",
    ];

    const questions = [...baseQuestions];

    if (role === "VENDOR") questions.push(...vendorQuestions);
    if (role === "MODERATOR" || role === "ADMIN" || role === "SUPER_ADMIN")
      questions.push(...moderatorQuestions);
    if (role === "ADMIN" || role === "SUPER_ADMIN")
      questions.push(...adminQuestions);

    return questions;
  };

  const exampleQuestions = getExampleQuestions(userRole);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Inventory Assistant
        </h1>
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Your AI-powered assistant for inventory management
        </p>
      </div>

      <div
        className="mb-6 p-4 rounded-lg"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Your Role:
          </span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              userRole === "SUPER_ADMIN"
                ? "bg-purple-100 text-purple-800"
                : userRole === "ADMIN"
                ? "bg-blue-100 text-blue-800"
                : userRole === "MODERATOR"
                ? "bg-green-100 text-green-800"
                : userRole === "VENDOR"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {userRole}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Ask questions about inventory using natural language. Your assistant
          has access to information based on your role permissions.
        </p>
      </div>

      <div className="mb-6">
        <h2
          className="font-medium mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Example questions you can ask:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleQuestions.map((question, index) => (
            <div
              key={index}
              className="text-sm p-2 rounded border"
              style={{
                backgroundColor: "var(--input-background)",
                borderColor: "var(--input-border)",
                color: "var(--text-secondary)",
              }}
            >
              • {question}
            </div>
          ))}
        </div>
      </div>

      <InventoryAssistant />
    </div>
  );
}
