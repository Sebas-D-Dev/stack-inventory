import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import ModerateButton from "./ModerateButton";

export default async function ContentModerationPage() {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.isAdmin) {
    redirect("/");
  }

  // Fetch pending posts and comments
  const pendingPosts = await prisma.post.findMany({
    where: { modStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  const pendingComments = await prisma.comment.findMany({
    where: { modStatus: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
      post: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold themed-span-primary">
            Content Moderation
          </h1>
          <p className="themed-span-secondary">
            Review and moderate user-generated content
          </p>
        </div>
        <div className="flex gap-4">
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
          <Link
            href="/admin/moderation/guidelines"
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-accent)",
              color: "var(--button-accent-foreground)",
            }}
          >
            Manage Guidelines
          </Link>
        </div>
      </div>

      {/* Pending Posts Section */}
      <div
        className="rounded-lg shadow-sm mb-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: "var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Pending Posts ({pendingPosts.length})
          </h2>
        </div>

        {pendingPosts.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--text-secondary)" }}>
            No posts waiting for moderation
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: "var(--table-header-background)" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                      <Link href={`/posts/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                      {post.author?.name || post.author?.email || "Anonymous"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                      {new Date(post.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <ModerateButton 
                          id={post.id.toString()} 
                          type="post" 
                          action="approve" 
                        />
                        <ModerateButton 
                          id={post.id.toString()} 
                          type="post" 
                          action="reject" 
                        />
                        <Link
                          href={`/posts/${post.id}`}
                          className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Comments Section */}
      <div
        className="rounded-lg shadow-sm mb-8"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: "var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Pending Comments ({pendingComments.length})
          </h2>
        </div>

        {pendingComments.length === 0 ? (
          <div className="p-6 text-center" style={{ color: "var(--text-secondary)" }}>
            No comments waiting for moderation
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: "var(--table-header-background)" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--table-header-foreground)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingComments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                      <div className="max-w-xs truncate">{comment.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                      <Link href={`/posts/${comment.postId}`} className="hover:underline">
                        {comment.post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                      {comment.author?.name || comment.author?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: "var(--text-primary)" }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <ModerateButton 
                          id={comment.id} 
                          type="comment" 
                          action="approve" 
                        />
                        <ModerateButton 
                          id={comment.id} 
                          type="comment" 
                          action="reject" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}