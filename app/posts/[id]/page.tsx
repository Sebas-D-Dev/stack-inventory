export const dynamic = "force-dynamic"; // This disables SSG and ISR

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "@/components/buttons/DeleteButton";
import EditButton from "@/components/buttons/EditButton";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = parseInt(id);

  // Get the current user session
  const session = await getServerSession(authOptions);

  // Properly extract user ID and admin status from session
  const userId = session?.user?.id;
  const isAdmin = session?.user?.isAdmin;

  // For debugging - log to console
  console.log("User session:", {
    userId,
    email: session?.user?.email,
    isAdmin,
  });

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
    },
  });

  if (!post) {
    notFound();
  }

  // Check if the current user is the author of the post or an admin
  const isAuthor = userId === post.authorId;
  const canEditOrDelete = isAuthor || isAdmin;

  console.log("Authorization check:", {
    isAuthor,
    isAdmin,
    canEditOrDelete,
    postAuthorId: post.authorId,
  });

  // Server action to delete the post
  async function deletePost() {
    "use server";

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Check if user is admin
    const isAdmin = session?.user?.isAdmin;

    // Re-fetch the post to ensure it exists within this server action
    const postToDelete = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!postToDelete) {
      throw new Error("Post not found");
    }

    // Check permissions again on the server side
    if (userId !== postToDelete.authorId && !isAdmin) {
      throw new Error("Not authorized to delete this post");
    }

    // Create deletion history entry
    await prisma.postHistory.create({
      data: {
        postId: postToDelete.id,
        title: postToDelete.title,
        content: postToDelete.content || "",
        action: "DELETE",
        performedById: userId || "",
      },
    });

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    redirect("/posts");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <article className="max-w-3xl w-full shadow-lg rounded-lg p-8">
        {/* Post Title */}
        <h1 className="text-5xl font-extrabold mb-4">{post.title}</h1>

        {/* Author Information */}
        <p className="text-lg mb-4">
          by{" "}
          <span className="font-medium">
            {post.author?.name || "Anonymous"}
          </span>
          {isAdmin && (
            <span className="ml-2 text-blue-500 font-bold">(Admin View)</span>
          )}
        </p>

        {/* Content Section */}
        <div className="text-lg leading-relaxed space-y-6 border-t pt-6">
          {post.content ? (
            <p>{post.content}</p>
          ) : (
            <p className="italic">No content available for this post.</p>
          )}
        </div>
      </article>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
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

        {canEditOrDelete ? (
          <>
            <EditButton editPath={`/posts/${id}/edit`} itemName="post" />
            <DeleteButton deleteAction={deletePost} itemName="post" />
          </>
        ) : null}
      </div>
    </div>
  );
}
