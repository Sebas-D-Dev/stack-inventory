import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PostHistoryPage() {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.isAdmin) {
    redirect("/");
  }

  // Fetch post history
  const postHistory = await prisma.postHistory.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      performedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Post History Log
        </h1>
        <Link
          href="/posts"
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--button-background)",
            color: "var(--button-foreground)",
          }}
        >
          Back to Posts
        </Link>
      </div>

      {postHistory.length === 0 ? (
        <p className="text-center" style={{ color: "var(--text-secondary)" }}>
          No post history available.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="min-w-full"
            style={{
              backgroundColor: "var(--table-background)",
            }}
          >
            <thead
              style={{ backgroundColor: "var(--table-header-background)" }}
            >
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Date
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Post ID
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Title
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Action
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase"
                  style={{ color: "var(--table-header-foreground)" }}
                >
                  Performed By
                </th>
              </tr>
            </thead>
            <tbody>
              {postHistory.map((entry) => (
                <tr key={entry.id}>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.postId}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.title}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.action}
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {entry.performedBy.name} ({entry.performedBy.email})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
