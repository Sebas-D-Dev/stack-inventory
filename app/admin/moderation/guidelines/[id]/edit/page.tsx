import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import GuidelineForm from "../../GuidelineForm";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/lib/button-variants";
import { textVariants, cardVariants } from "@/lib/ui-variants";

interface EditGuidelinePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGuidelinePage({
  params,
}: EditGuidelinePageProps) {
  const { id } = await params;

  // Check if user is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.isAdmin) {
    redirect("/");
  }

  // Fetch the guideline
  const guideline = await prisma.contentGuideline.findUnique({
    where: { id },
  });

  if (!guideline) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={cn(textVariants({ variant: "h1" }))}>
            Edit Content Guideline
          </h1>
          <p className={cn(textVariants({ variant: "muted" }))}>
            Update the content guideline details
          </p>
        </div>
        <Link
          href="/admin/moderation/guidelines"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Back to Guidelines
        </Link>
      </div>

      <div className={cn(cardVariants({ variant: "default" }), "p-6")}>
        <h2 className={cn(textVariants({ variant: "h3" }), "mb-4")}>
          Edit Guideline
        </h2>
        <GuidelineForm guideline={guideline} />
      </div>
    </div>
  );
}
