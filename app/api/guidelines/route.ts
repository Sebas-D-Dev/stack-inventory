import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const guidelines = await prisma.contentGuideline.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        isActive: true,
      },
    });

    return NextResponse.json(guidelines);
  } catch (error) {
    console.error("Error fetching guidelines:", error);
    return NextResponse.json(
      { error: "Failed to fetch guidelines" },
      { status: 500 }
    );
  }
}
