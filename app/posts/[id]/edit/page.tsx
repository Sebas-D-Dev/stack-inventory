"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Removed useRouter
import Form from "next/form";
import { updatePost } from "./actions";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  content: string | null;
  authorId: string;
  author?: {
    name: string;
  };
}

export default function EditPost() {
  const params = useParams();
  // Removed unused router variable
  const id = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (!response.ok) {
          throw new Error(response.statusText || "Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    try {
      await updatePost(id, formData);
    } catch (err) {
      console.error("Error updating post:", err);
      setError(err instanceof Error ? err.message : "Failed to update post");
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
        <div className="themed-loading-container">
          <div className="themed-spinner"></div>
          <p className="themed-loading-text">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          {error}
        </div>
        <Link
          href={`/posts/${id}`}
          className="form-button py-2 px-4 inline-block"
        >
          Back to Post
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          Post not found
        </div>
        <Link href="/posts" className="form-button py-2 px-4 inline-block">
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-lg my-8 themed-card">
      <h1 className="text-2xl font-bold mb-6 themed-span-primary">Edit Post</h1>

      <Form action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="themed-label required-field">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={post.title}
            placeholder="Enter your post title ..."
            className="themed-input"
          />
        </div>

        <div>
          <label htmlFor="content" className="themed-label">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your post content here ..."
            rows={8}
            defaultValue={post.content || ""}
            className="themed-input"
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
        )}

        <div className="flex gap-3 justify-end">
          <Link
            href={`/posts/${id}`}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--button-background)",
              color: "var(--button-foreground)",
            }}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="form-button py-2 px-4 flex justify-center items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="themed-spinner themed-spinner-sm mr-2"></div>
                <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}
