import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      sku,
      price, 
      quantity, 
      minimumOrderQuantity,
      leadTime,
      categoryId,
      vendorId,
      overrideConstraints 
    } = body;

    // Check if product exists and user has permission to edit it
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Allow editing if user is admin or owns the product
    const canEdit = session.user.role === "ADMIN" || 
                   session.user.role === "SUPER_ADMIN" || 
                   existingProduct.userId === session.user.id;

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit this product" }, 
        { status: 403 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        minimumOrderQuantity: minimumOrderQuantity ? parseInt(minimumOrderQuantity, 10) : 1,
        leadTime: leadTime ? parseInt(leadTime, 10) : null,
        categoryId,
        vendorId,
        overrideConstraints: Boolean(overrideConstraints),
      },
      include: {
        category: true,
        vendor: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
