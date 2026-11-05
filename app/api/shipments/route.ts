import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb.ts";
import Shipment from "../../../models/Shipment.ts";

// GET: Fetch all shipments
export async function GET() {
  try {
    await connectDB();

    const shipments = await Shipment.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      shipments,
    });
  } catch (error) {
    console.error("Fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch shipments" },
      { status: 500 }
    );
  }
}

// POST: Create a shipment
export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      product,
      origin,
      destination,
      temperature,
      humidity,
    } = body;

    if (!product || !origin || !destination || !temperature) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const shipment = await Shipment.create({
      shipmentId: `SHP-${Date.now()}`,
      product,
      origin,
      destination,
      temperature,
      humidity: humidity || "N/A",
      status: "In Transit",
      risk: "Low",
    });

    return NextResponse.json(
      { success: true, shipment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create shipment" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a shipment
export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");

    if (!shipmentId) {
      return NextResponse.json(
        { success: false, message: "Shipment ID required" },
        { status: 400 }
      );
    }

    const deleted = await Shipment.findOneAndDelete({
      shipmentId,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Shipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Shipment deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete shipment" },
      { status: 500 }
    );
  }
}