"use client";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  className,
}: OrderStatusBadgeProps) {
  const getStatusText = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {getStatusText(status)}
    </span>
  );
}
