"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import InventoryAssistant from "@/components/ai/InventoryAssistant";

export default function InventoryAssistantPage() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) {
      redirect("/");
    }
  }, [session]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Inventory Management Assistant
      </h1>

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          Ask questions about your inventory, get product recommendations, or
          analyze stock trends using natural language.
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Powered by Google Gemini AI, your assistant has access to current
          inventory data, recent movements, and external deals.
        </p>
      </div>

      <div className="mb-4">
        <h2 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          Example questions:
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
          <li>Which products are running low on stock?</li>
          <li>What&apos;s the total value of our current inventory?</li>
          <li>
            Are there any good deals available for products we need to restock?
          </li>
          <li>Which category has the most products?</li>
          <li>What were the most recent inventory movements?</li>
        </ul>
      </div>

      <InventoryAssistant />
    </div>
  );
}
