import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/auth";
import { canAccessAdminFeatures } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import OrderEditForm from "./OrderEditForm";

interface OrderEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  const resolvedParams = await params;

  // Check if user can access admin features
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminFeatures(session.user.role || "")) {
    redirect("/");
  }

  // Fetch the specific order with all details
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: resolvedParams.id },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          website: true,
        },
      },
      requestedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true,
              quantity: true,
              price: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          product: {
            name: "asc",
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Fetch all vendors for the vendor dropdown
  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <OrderEditForm
        order={order}
        vendors={vendors}
        currentUserRole={session.user.role || ""}
      />
    </div>
  );
}
