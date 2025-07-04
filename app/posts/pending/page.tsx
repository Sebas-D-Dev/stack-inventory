"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface PendingPost {
  id: number;
  title: string;
  createdAt: string;
  modStatus: string;
}

export default function PendingPostsPage() {
  const { data: session } = useSession();
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingPosts() {
      if (!session?.user) return;
      
      try {
        const response = await fetch("/api/posts/pending");
        if (response.ok) {
          const data = await response.json();
          setPendingPosts(data);
        }
      } catch (error) {
        console.error("Error fetching pending posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPendingPosts();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start p-8">
        <div className="max-w-3xl w-full text-center p-8">
          <p className="mb-4">Please sign in to view your pending posts</p>
          <Link
            href="/login"
            className="form-button py-2 px-4 inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8">
      <div className="max-w-3xl w-full mb-8">
        <h1 className="text-3xl font-bold mb-4 themed-span-primary">Posts Pending Approval</h1>
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          These posts are awaiting moderation and will be published once approved.
        </p>
        
        <div className="flex justify-between mb-8">
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
          
          <Link
            href="/posts/new"
            className="form-button py-2 px-4 flex items-center"
          >
            <span>Create New Post</span>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="themed-loading-container">
            <div className="themed-spinner"></div>
            <p className="themed-loading-text">Loading your pending posts...</p>
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="text-center p-8 border rounded-lg" style={{ borderColor: "var(--card-border)" }}>
            <p className="mb-4">You don&apos;t have any posts pending approval.</p>
            <Link
              href="/posts/new"
              className="form-button py-2 px-4 inline-block"
            >
              Create a Post
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {pendingPosts.map((post) => (
              <li 
                key={post.id} 
                className="border p-6 rounded-lg"
                style={{ borderColor: "var(--card-border)" }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Created on {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800"
                  >
                    {post.modStatus === "PENDING" ? "Pending" : "In Review"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}