"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

interface SettingsFormProps {
  category: string;
  title: string;
  description: string;
  settings: SystemSetting[];
}

export default function SettingsForm({
  category,
  title,
  description,
  settings,
}: SettingsFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    // Initialize form data from settings
    const data: Record<string, string> = {};
    settings.forEach((setting) => {
      data[setting.key] = setting.value;
    });

    // Add default fields based on category
    if (category === "email" && !data["emailSender"]) {
      data["emailSender"] = "noreply@example.com";
      data["orderConfirmationTemplate"] =
        "Your order #{orderId} has been confirmed.";
      data["lowStockAlertTemplate"] =
        "Product {productName} is running low on stock.";
    } else if (category === "inventory" && !data["globalLowStockThreshold"]) {
      data["globalLowStockThreshold"] = "5";
      data["criticalStockThreshold"] = "2";
      data["overstockThreshold"] = "50";
    } else if (category === "workingHours" && !data["workingDays"]) {
      data["workingDays"] = "Monday-Friday";
      data["workingHoursStart"] = "09:00";
      data["workingHoursEnd"] = "17:00";
    } else if (category === "backup" && !data["backupFrequency"]) {
      data["backupFrequency"] = "daily";
      data["backupTime"] = "00:00";
      data["retentionPeriod"] = "30";
    }

    return data;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          settings: formData,
        }),
      });

      if (response.ok) {
        setSuccess("Settings updated successfully");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: "var(--card-background)",
        borderColor: "var(--card-border)",
        borderWidth: "1px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {category === "email" && (
          <>
            <div>
              <label htmlFor="emailSender" className="form-label">
                Default Sender Email
              </label>
              <input
                type="email"
                id="emailSender"
                name="emailSender"
                value={formData.emailSender || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="orderConfirmationTemplate" className="form-label">
                Order Confirmation Template
              </label>
              <textarea
                id="orderConfirmationTemplate"
                name="orderConfirmationTemplate"
                value={formData.orderConfirmationTemplate || ""}
                onChange={handleChange}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="lowStockAlertTemplate" className="form-label">
                Low Stock Alert Template
              </label>
              <textarea
                id="lowStockAlertTemplate"
                name="lowStockAlertTemplate"
                value={formData.lowStockAlertTemplate || ""}
                onChange={handleChange}
                className="form-textarea"
                rows={3}
              />
            </div>
          </>
        )}

        {category === "inventory" && (
          <>
            <div>
              <label htmlFor="globalLowStockThreshold" className="form-label">
                Global Low Stock Threshold
              </label>
              <input
                type="number"
                id="globalLowStockThreshold"
                name="globalLowStockThreshold"
                value={formData.globalLowStockThreshold || ""}
                onChange={handleChange}
                className="form-input"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="criticalStockThreshold" className="form-label">
                Critical Stock Threshold
              </label>
              <input
                type="number"
                id="criticalStockThreshold"
                name="criticalStockThreshold"
                value={formData.criticalStockThreshold || ""}
                onChange={handleChange}
                className="form-input"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="overstockThreshold" className="form-label">
                Overstock Threshold
              </label>
              <input
                type="number"
                id="overstockThreshold"
                name="overstockThreshold"
                value={formData.overstockThreshold || ""}
                onChange={handleChange}
                className="form-input"
                min="1"
              />
            </div>
          </>
        )}

        {category === "workingHours" && (
          <>
            <div>
              <label htmlFor="workingDays" className="form-label">
                Working Days
              </label>
              <input
                type="text"
                id="workingDays"
                name="workingDays"
                value={formData.workingDays || ""}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Monday-Friday"
              />
            </div>
            <div>
              <label htmlFor="workingHoursStart" className="form-label">
                Working Hours Start
              </label>
              <input
                type="time"
                id="workingHoursStart"
                name="workingHoursStart"
                value={formData.workingHoursStart || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="workingHoursEnd" className="form-label">
                Working Hours End
              </label>
              <input
                type="time"
                id="workingHoursEnd"
                name="workingHoursEnd"
                value={formData.workingHoursEnd || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </>
        )}

        {category === "backup" && (
          <>
            <div>
              <label htmlFor="backupFrequency" className="form-label">
                Backup Frequency
              </label>
              <select
                id="backupFrequency"
                name="backupFrequency"
                value={formData.backupFrequency || ""}
                onChange={handleChange}
                className="form-select"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label htmlFor="backupTime" className="form-label">
                Backup Time
              </label>
              <input
                type="time"
                id="backupTime"
                name="backupTime"
                value={formData.backupTime || ""}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div>
              <label htmlFor="retentionPeriod" className="form-label">
                Retention Period (days)
              </label>
              <input
                type="number"
                id="retentionPeriod"
                name="retentionPeriod"
                value={formData.retentionPeriod || ""}
                onChange={handleChange}
                className="form-input"
                min="1"
              />
            </div>
          </>
        )}

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {success && <div className="text-green-500 text-sm">{success}</div>}

        <button
          type="submit"
          className="form-button py-2 px-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="themed-spinner themed-spinner-sm mr-2"></div>
              <span>Saving...</span>
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </form>
    </div>
  );
}
