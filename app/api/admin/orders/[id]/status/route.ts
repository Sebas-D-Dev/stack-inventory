import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { canAccessAdminFeatures } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params } : { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminFeatures(session.user.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await request.json();
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = [
      "DRAFT",
      "PENDING_APPROVAL", 
      "APPROVED",
      "ORDERED",
      "PARTIALLY_RECEIVED",
      "RECEIVED",
      "CANCELLED"
    ] as const;

    type PurchaseStatus = typeof validStatuses[number];

    if (!validStatuses.includes(status as PurchaseStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get the current order
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update the order
    const updateData: {
      status: string;
      approverId?: string;
      orderDate?: Date;
      receivedDate?: Date;
    } = {
      status,
    };

    // Set appropriate dates and approver based on status
    if (status === "APPROVED" && !existingOrder.approverId) {
      updateData.approverId = session.user.id;
    }
    
    if (status === "ORDERED" && !existingOrder.orderDate) {
      updateData.orderDate = new Date();
    }
    
    if (status === "RECEIVED" && !existingOrder.receivedDate) {
      updateData.receivedDate = new Date();
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        status: status as PurchaseStatus,
        ...(updateData.approverId && { approverId: updateData.approverId }),
        ...(updateData.orderDate && { orderDate: updateData.orderDate }),
        ...(updateData.receivedDate && { receivedDate: updateData.receivedDate }),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_ORDER_STATUS",
        entityType: "PURCHASE_ORDER",
        entityId: orderId,
        details: JSON.stringify({
          oldStatus: existingOrder.status,
          newStatus: status,
          orderId,
        }),
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
