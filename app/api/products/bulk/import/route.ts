import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { parse } from 'papaparse';

interface ProductImportRow {
  name: string;
  sku: string;
  price: string;
  quantity: string;
  categoryId: string;
  vendorId: string;
  unitOfMeasure?: string;
  location?: string;
  barcode?: string;
  leadTime?: string;
  minimumOrderQuantity?: string;
  notes?: string;
  overrideConstraints?: string;
}

export async function POST(request: Request) {
  // Check authentication and admin status
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    
    // Parse CSV data
    const parseResult = parse<ProductImportRow>(text, { header: true });
    const data = parseResult.data;
    const errors = parseResult.errors;

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Invalid CSV format", details: errors },
        { status: 400 }
      );
    }

    // Process and validate each product
    const products = [];
    const validationErrors = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as ProductImportRow;
      const rowNum = i + 2; // +2 for header row and 0-indexing
      
      // Validate required fields
      if (!row.name || !row.sku || !row.price || !row.quantity || !row.categoryId || !row.vendorId) {
        validationErrors.push(`Row ${rowNum}: Missing required fields`);
        continue;
      }
      
      // Validate numeric fields
      const price = parseFloat(row.price);
      const quantity = parseInt(row.quantity, 10);
      
      if (isNaN(price) || price <= 0) {
        validationErrors.push(`Row ${rowNum}: Invalid price`);
        continue;
      }
      
      if (isNaN(quantity) || quantity < 0) {
        validationErrors.push(`Row ${rowNum}: Invalid quantity`);
        continue;
      }
      
      products.push({
        name: row.name,
        sku: row.sku,
        price: price,
        quantity: quantity,
        categoryId: row.categoryId,
        vendorId: row.vendorId,
        userId: session.user.id,
        unitOfMeasure: row.unitOfMeasure || "EACH",
        location: row.location || "",
        barcode: row.barcode || "",
        leadTime: row.leadTime ? parseInt(row.leadTime, 10) : null,
        minimumOrderQuantity: row.minimumOrderQuantity ? parseInt(row.minimumOrderQuantity, 10) : 1,
        notes: row.notes || "",
        overrideConstraints: row.overrideConstraints === "true" || false
      });
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }
    
    // Insert products into database
    const result = await prisma.$transaction(
      products.map(product => 
        prisma.product.upsert({
          where: { sku: product.sku },
          update: product,
          create: product
        })
      )
    );
    
    return NextResponse.json({
      success: true,
      count: result.length,
      message: `Successfully imported ${result.length} products`
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    );
  }
}