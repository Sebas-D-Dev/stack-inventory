import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Fetch vendors with product count
  const vendors = await prisma.vendor.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ vendors });
}