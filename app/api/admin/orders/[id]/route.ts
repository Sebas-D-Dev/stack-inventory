import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { canAccessAdminFeatures } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessAdminFeatures(session.user.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const {
      status,
      notes,
      orderDate,
      expectedDate,
      receivedDate,
      vendorId,
    } = body;

    // Validate required fields
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
      "CANCELLED",
    ] as const;

    type PurchaseStatus = typeof validStatuses[number];

    if (!validStatuses.includes(status as PurchaseStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if the order exists
    const existingOrder = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Validate vendor exists if vendorId is provided
    if (vendorId) {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        return NextResponse.json(
          { error: "Invalid vendor" },
          { status: 400 }
        );
      }
    }

    // Permission checks for status changes
    const canApprove = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const canCancel = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

    if (status === "APPROVED" && !canApprove) {
      return NextResponse.json(
        { error: "Insufficient permissions to approve orders" },
        { status: 403 }
      );
    }

    if (status === "CANCELLED" && !canCancel) {
      return NextResponse.json(
        { error: "Insufficient permissions to cancel orders" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: {
      status: PurchaseStatus;
      notes: string | null;
      orderDate?: Date | null;
      expectedDate?: Date | null;
      receivedDate?: Date | null;
      vendorId?: string;
      approverId?: string;
    } = {
      status: status as PurchaseStatus,
      notes: notes || null,
    };

    // Handle dates
    if (orderDate !== undefined) {
      updateData.orderDate = orderDate ? new Date(orderDate) : null;
    }

    if (expectedDate !== undefined) {
      updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;
    }

    if (receivedDate !== undefined) {
      updateData.receivedDate = receivedDate ? new Date(receivedDate) : null;
    }

    if (vendorId) {
      updateData.vendorId = vendorId;
    }

    // If status is being changed to APPROVED, set the approver
    if (status === "APPROVED" && existingOrder.status !== "APPROVED") {
      updateData.approverId = session.user.id;
    }

    // Update the order
    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: updateData,
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
              },
            },
          },
        },
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id!,
        action: "UPDATE_ORDER",
        entityType: "PurchaseOrder",
        entityId: orderId,
        details: JSON.stringify({
          orderId,
          previousStatus: existingOrder.status,
          newStatus: status,
          changes: Object.keys(updateData),
        }),
      },
    });

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
