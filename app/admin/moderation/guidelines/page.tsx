import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import GuidelineForm from "./GuidelineForm";
import DeleteGuidelineButton from "./DeleteGuidelineButton";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import { textVariants, cardVariants } from "@/lib/ui-variants";

export default async function ContentGuidelinesPage() {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.isAdmin) {
    redirect("/");
  }

  // Fetch all guidelines
  const guidelines = await prisma.contentGuideline.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={cn(textVariants({ variant: "h1" }))}>
            Content Guidelines
          </h1>
          <p className={cn(textVariants({ variant: "muted" }))}>
            Manage content guidelines for user-generated content
          </p>
        </div>
        <Link
          href="/admin/moderation"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to Moderation
        </Link>
      </div>

      {/* Add New Guideline Form */}
      <div className={cn(cardVariants({ variant: "default" }), "mb-8 p-6")}>
        <h2 className={cn(textVariants({ variant: "h3" }), "mb-4")}>
          Add New Guideline
        </h2>
        <GuidelineForm />
      </div>

      {/* Guidelines List */}
      <div className={cn(cardVariants({ variant: "default" }))}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className={cn(textVariants({ variant: "h3" }))}>
            Current Guidelines ({guidelines.length})
          </h2>
        </div>

        {guidelines.length === 0 ? (
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3
                className={cn(
                  textVariants({ variant: "h3" }),
                  "mt-4 text-lg font-semibold"
                )}
              >
                No guidelines yet
              </h3>
              <p className={cn(textVariants({ variant: "muted" }), "mt-2")}>
                Create your first content guideline to help users understand
                community standards.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              {guidelines.map((guideline, index) => (
                <div
                  key={guideline.id}
                  className={cn(
                    "relative p-6 rounded-lg border border-gray-200 dark:border-gray-700",
                    "bg-gray-50/50 dark:bg-gray-800/50",
                    "transition-all duration-200 hover:shadow-md"
                  )}
                >
                  {/* Guideline Number Badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3
                          className={cn(
                            textVariants({ variant: "h3" }),
                            "text-lg font-semibold"
                          )}
                        >
                          {guideline.title}
                        </h3>
                      </div>

                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div
                          className={cn(
                            textVariants({ variant: "body" }),
                            "whitespace-pre-line leading-relaxed"
                          )}
                          style={{ lineHeight: "1.6" }}
                        >
                          {guideline.description}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Created:{" "}
                          {new Date(guideline.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          Updated:{" "}
                          {new Date(guideline.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-fit">
                      <Link
                        href={`/admin/moderation/guidelines/${guideline.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" })
                        )}
                      >
                        Edit
                      </Link>
                      <DeleteGuidelineButton
                        id={guideline.id}
                        title={guideline.title}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
