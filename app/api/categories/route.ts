import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Fetch categories with product count
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      }
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}