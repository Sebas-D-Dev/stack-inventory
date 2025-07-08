import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SettingsForm from "./SettingsForm";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

import { canManageSystemSettings } from "@/lib/permissions";

export default async function SystemSettings() {
  // Check if user can manage system settings
  const session = await getServerSession(authOptions);
  if (!session?.user || !canManageSystemSettings(session.user.role || "")) {
    redirect("/");
  }

  // Fetch all system settings
  const settings = await prisma.systemSetting.findMany();

  // Group settings by category
  const groupedSettings = settings.reduce<Record<string, SystemSetting[]>>(
    (acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold themed-span-primary">
          System Settings
        </h1>
        <Link
          href="/admin/dashboard"
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--button-background)",
            color: "var(--button-foreground)",
          }}
        >
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingsForm
          category="email"
          title="Email Templates"
          description="Configure system email templates"
          settings={groupedSettings.email || []}
        />

        <SettingsForm
          category="inventory"
          title="Inventory Thresholds"
          description="Set global inventory alert thresholds"
          settings={groupedSettings.inventory || []}
        />

        <SettingsForm
          category="workingHours"
          title="Working Hours/Days"
          description="Define system working hours and days"
          settings={groupedSettings.workingHours || []}
        />

        <SettingsForm
          category="backup"
          title="Backup Schedules"
          description="Configure automatic backup schedules"
          settings={groupedSettings.backup || []}
        />
      </div>
    </div>
  );
}
