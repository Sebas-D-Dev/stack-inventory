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
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if user just created a post
  useEffect(() => {
    if (searchParams.get("created") === "true") {
      setShowSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  // Check if user is an admin
  useEffect(() => {
    if (session?.user) {
      // Check if user is admin
      setIsAdmin(session.user.isAdmin || false);
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
      <div
        className="w-full max-w-4xl mx-auto"
        style={{
          marginBottom: `var(--spacing-xl)`,
          padding: `0 var(--spacing-md)`,
        }}
      >
        {/* Success Message */}
        {showSuccess && (
          <div
            className="border rounded-lg"
            style={{
              marginBottom: `var(--spacing-lg)`,
              padding: `var(--spacing-md)`,
              backgroundColor: "rgb(240, 253, 244)",
              borderColor: "rgb(34, 197, 94)",
              color: "rgb(21, 128, 61)",
            }}
          >
            <div className="flex items-center">
              <svg
                style={{
                  width: `var(--spacing-lg)`,
                  height: `var(--spacing-lg)`,
                  marginRight: `var(--spacing-sm)`,
                  color: "rgb(34, 197, 94)",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p
                style={{
                  fontSize: `var(--font-base)`,
                  color: "rgb(21, 128, 61)",
                }}
              >
                {isAdmin
                  ? "Your post has been created and published successfully!"
                  : "Your post has been created successfully! It's now pending approval and will be visible once reviewed by our moderation team."}
              </p>
            </div>
          </div>
        )}

        <div
          className="flex flex-col lg:flex-row lg:justify-between lg:items-center"
          style={{
            marginBottom: `var(--spacing-lg)`,
            gap: `var(--spacing-md)`,
          }}
        >
          <h1 className="text-responsive-3xl font-bold themed-span-primary">
            Posts
          </h1>

          {/* Action Buttons */}
          {session && (
            <div className="action-button-group">
              <Link href="/posts/new" className="form-button">
                <span>New Post</span>
              </Link>
              <Link
                href="/posts/pending"
                className="form-button"
                style={{
                  backgroundColor: "rgb(254, 240, 138)",
                  color: "rgb(146, 64, 14)",
                  borderRadius: `var(--radius-md)`,
                }}
              >
                <svg
                  style={{
                    width: `var(--spacing-md)`,
                    height: `var(--spacing-md)`,
                    marginRight: `var(--spacing-xs)`,
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Pending Posts</span>
              </Link>
              <Link
                href="/posts?filter=mine"
                className="form-button"
                style={{
                  backgroundColor:
                    filter === "mine"
                      ? "rgb(37, 99, 235)"
                      : "rgb(229, 231, 235)",
                  color: filter === "mine" ? "white" : "rgb(75, 85, 99)",
                }}
              >
                <span>My Posts</span>
              </Link>
              <Link
                href="/posts?filter=all"
                className="form-button"
                style={{
                  backgroundColor:
                    filter === "all" || !filter
                      ? "rgb(37, 99, 235)"
                      : "rgb(229, 231, 235)",
                  color:
                    filter === "all" || !filter ? "white" : "rgb(75, 85, 99)",
                }}
              >
                <span>All Posts</span>
              </Link>
              {isAdmin && (
                <Link href="/admin/posts/history" className="form-button">
                  <span>Post History</span>
                </Link>
              )}
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
    <div
      className="min-h-screen flex flex-col items-center justify-start"
      style={{ padding: `var(--spacing-xl)` }}
    >
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
