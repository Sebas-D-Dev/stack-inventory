import { cn } from "@/lib/cn";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

export function Table({ children, className }: TableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-auto rounded-lg border",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        className
      )}
    >
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50 dark:bg-gray-900", className)}>
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody
      className={cn("divide-y divide-gray-200 dark:divide-gray-700", className)}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className,
  header = false,
}: TableCellProps) {
  const Comp = header ? "th" : "td";

  return (
    <Comp
      className={cn(
        "px-6 py-4 text-left",
        header
          ? "text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          : "text-sm text-gray-900 dark:text-gray-100",
        className
      )}
    >
      {children}
    </Comp>
  );
}
