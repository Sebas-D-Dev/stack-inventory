"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Post {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
  author?: {
    name: string;
    id: string;
  };
}

// Disable static generation
export const dynamic = "force-dynamic";

function PostsList() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const filter = searchParams.get("filter") || "all";
  const { data: session } = useSession();

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is an admin
  useEffect(() => {
    if (session?.user) {
      // Type-safe check for the role property
      const userRole = (session.user as { role?: string }).role;
      setIsAdmin(userRole === "ADMIN");
    }
  }, [session]);

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        let url = `/api/posts?page=${page}`;

        // Add filter to URL if needed
        if (filter === "mine" && session?.user) {
          url += `&authorId=${session.user.id}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await res.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, [page, filter, session]);

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold themed-span-primary">Posts</h1>

          {/* Action Buttons */}
          {session && (
            <div className="flex flex-wrap gap-4">
              {/* Create Actions */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/posts/new"
                    className="form-button py-2 px-4 flex items-center"
                  >
                    <span>New Post</span>
                  </Link>
                  <Link
                    href="/posts?filter=mine"
                    className={`py-2 px-4 flex items-center rounded-lg transition-colors ${
                      filter === "mine"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span>My Posts</span>
                  </Link>
                  <Link
                    href="/posts?filter=all"
                    className={`py-2 px-4 flex items-center rounded-lg transition-colors ${
                      filter === "all" || !filter
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span>All Posts</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/posts/history"
                      className="py-2 px-4 flex items-center rounded-lg transition-colors"
                      style={{
                        backgroundColor: "var(--button-background)",
                        color: "var(--button-foreground)",
                      }}
                    >
                      <span>Post History</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading posts...</p>
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <p className="text-gray-600 text-center">No posts available.</p>
          ) : (
            <ul className="space-y-6 w-full max-w-4xl mx-auto">
              {posts.map((post) => (
                <li key={post.id} className="border p-6 rounded-lg shadow-md">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-2xl font-semibold hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm">
                    by {post.author?.name || "Anonymous"}
                  </p>
                  <p className="text-xs">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-center space-x-4 mt-8">
            {page > 1 && (
              <Link
                href={`/posts?page=${page - 1}${
                  filter !== "all" ? `&filter=${filter}` : ""
                }`}
              >
                <button className="px-4 py-2 rounded">Previous</button>
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/posts?page=${page + 1}${
                  filter !== "all" ? `&filter=${filter}` : ""
                }`}
              >
                <button className="px-4 py-2 rounded">Next</button>
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function PostsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8">
      <Suspense
        fallback={
          <div className="themed-loading-container themed-loading-fullscreen">
            <div className="themed-spinner"></div>
            <p className="themed-loading-text">Loading page...</p>
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  );
}
