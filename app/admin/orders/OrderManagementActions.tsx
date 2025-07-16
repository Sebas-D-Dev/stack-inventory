"use client";

import { useRouter } from "next/navigation";

interface OrderManagementActionsProps {
  order: {
    id: string;
    status: string;
    requesterId: string;
    approverId: string | null;
  };
  currentUserRole: string;
}

export default function OrderManagementActions({
  order,
}: OrderManagementActionsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col space-y-1">
      <button
        onClick={() => router.push(`/admin/orders/${order.id}`)}
        className="text-sm font-medium text-blue-600 hover:text-blue-900"
      >
        View Details
      </button>
    </div>
  );
}
