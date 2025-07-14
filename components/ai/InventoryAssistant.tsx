"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronRightIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function InventoryAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your inventory assistant powered by Google Gemini. I can help you with inventory queries, reorder recommendations, and more. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/inventory-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error getting assistant response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat history cleared. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex flex-col h-[600px] rounded-lg border overflow-hidden"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
      }}
    >
      <div
        className="p-4 border-b flex justify-between items-center"
        style={{ borderColor: "var(--card-border)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Inventory Assistant
        </h2>
        <button
          onClick={clearChat}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Clear chat history"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-200" : "text-gray-500"
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex"
        style={{ borderColor: "var(--card-border)" }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about inventory status, product suggestions, or reordering..."
          className="flex-1 p-2 rounded-l-md border focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: "var(--input-background)",
            borderColor: "var(--input-border)",
            color: "var(--text-primary)",
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}
