import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import GuidelineForm from "./GuidelineForm";

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
          <h1 className="text-3xl font-bold themed-span-primary">
            Content Guidelines
          </h1>
          <p className="themed-span-secondary">
            Manage content guidelines for user-generated content
          </p>
        </div>
        <Link
          href="/admin/moderation"
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: "var(--button-background)",
            color: "var(--button-foreground)",
          }}
        >
          Back to Moderation
        </Link>
      </div>

      {/* Add New Guideline Form */}
      <div
        className="rounded-lg shadow-sm mb-8 p-6"
        style={{
          backgroundColor: "var(--card-background)",
          borderColor: "var(--card-border)",
          borderWidth: "1px",
        }}
      >
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Add New Guideline
        </h2>
        <GuidelineForm />
      </div>

      {/* Guidelines List */}
      <div
        className="rounded-lg shadow-sm"
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
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Current Guidelines
          </h2>
        </div>

        {guidelines.length === 0 ? (
          <div
            className="p-6 text-center"
            style={{ color: "var(--text-secondary)" }}
          >
            No content guidelines have been defined
          </div>
        ) : (
          <div className="p-4">
            <ul className="space-y-4">
              {guidelines.map((guideline) => (
                <li
                  key={guideline.id}
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: "var(--card-border)",
                    opacity: guideline.isActive ? 1 : 0.6,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className="text-lg font-medium mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {guideline.title}
                      </h3>
                      <p style={{ color: "var(--text-secondary)" }}>
                        {guideline.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/moderation/guidelines/${guideline.id}/edit`}
                        className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        className={`px-2 py-1 rounded text-xs ${
                          guideline.isActive
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {guideline.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                  <div
                    className="mt-2 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Last updated:{" "}
                    {new Date(guideline.updatedAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
