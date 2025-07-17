"use client";

import Form from "next/form";
import { createPost } from "./actions";
import GuidelinesWidget from "@/components/GuidelinesWidget";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import { textVariants, cardVariants } from "@/lib/ui-variants";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function NewPost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createPost(formData);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={cn(textVariants({ variant: "h1" }))}>
            Create New Post
          </h1>
          <p className={cn(textVariants({ variant: "muted" }))}>
            Share your thoughts with the community
          </p>
        </div>
        <GuidelinesWidget />
      </div>

      <div className={cn(cardVariants({ variant: "default" }), "p-6")}>
        <Form action={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className={cn(
                textVariants({ variant: "small" }),
                "block mb-2 font-medium"
              )}
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              disabled={isSubmitting}
              placeholder="Enter your post title..."
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
                "rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className={cn(
                textVariants({ variant: "small" }),
                "block mb-2 font-medium"
              )}
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              placeholder="Write your post content here..."
              rows={8}
              disabled={isSubmitting}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
                "rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                "placeholder-gray-500 dark:placeholder-gray-400",
                "resize-vertical disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                {isAdmin
                  ? "Your post will be published immediately."
                  : "Your post will be reviewed by admins before being published."}
              </p>
              <p>Please review our community guidelines before posting.</p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                buttonVariants({ variant: "default" }),
                "min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
