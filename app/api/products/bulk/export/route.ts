import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { unparse } from 'papaparse';

export async function GET() {
  // Check authentication and admin status
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all products with related data
    const products = await prisma.product.findMany({
      include: {
        category: true,
        vendor: true,
      }
    });

    // Transform data for CSV export
    const csvData = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      vendorId: product.vendorId,
      vendorName: product.vendor.name,
      unitOfMeasure: product.unitOfMeasure,
      location: product.location,
      barcode: product.barcode,
      leadTime: product.leadTime,
      minimumOrderQuantity: product.minimumOrderQuantity,
      notes: product.notes,
      overrideConstraints: product.overrideConstraints
    }));

    // Convert to CSV
    const csv = unparse(csvData);
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`);
    
    return new NextResponse(csv, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}