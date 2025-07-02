import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { categoryId, adjustmentType, adjustmentValue } = await request.json();

    if (!categoryId || !adjustmentType || !adjustmentValue) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { categoryId },
    });

    const updatedProducts = products.map((product) => {
      let newPrice;
      if (adjustmentType === "percentage") {
        newPrice = product.price * (1 + adjustmentValue / 100);
      } else if (adjustmentType === "fixed") {
        newPrice = product.price + adjustmentValue;
      } else {
        throw new Error("Invalid adjustment type");
      }
      return { ...product, price: newPrice };
    });

    await prisma.$transaction(
      updatedProducts.map((p) =>
        prisma.product.update({
          where: { id: p.id },
          data: { price: p.price },
        })
      )
    );

    return NextResponse.json({ message: "Prices adjusted successfully" });
  } catch (error) {
    console.error("Error adjusting prices:", error);
    return NextResponse.json(
      { error: "Failed to adjust prices" },
      { status: 500 }
    );
  }
}
