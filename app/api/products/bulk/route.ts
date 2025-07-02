import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import Papa from "papaparse";

interface ProductData {
  name: string;
  description: string;
  sku: string;
  price: string;
  quantity: string;
  categoryId: string;
  vendorId: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileText = await file.text();

    const { data: products } = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
    });

    for (const product of products as ProductData[]) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          sku: product.sku,
          price: parseFloat(product.price),
          quantity: parseInt(product.quantity, 10),
          categoryId: product.categoryId,
          vendorId: product.vendorId,
        },
      });
    }

    return NextResponse.json({ message: "Products imported successfully" });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany();
    const csv = Papa.unparse(products);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="products.csv"',
      },
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
