import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import Reading from "@/models/Reading";

// Illustrative project thresholds, not validated safety standards.
function getTemperatureRange(product: string) {
  const name = product.toLowerCase();

  if (name.includes("frozen") || name.includes("ice cream")) {
    return { min: -25, max: -18 };
  }

  if (name.includes("vaccine") || name.includes("medicine")) {
    return { min: 2, max: 8 };
  }

  if (
    name.includes("dairy") ||
    name.includes("milk") ||
    name.includes("cheese") ||
    name.includes("yogurt")
  ) {
    return { min: 0, max: 5 };
  }

  if (
    name.includes("seafood") ||
    name.includes("fish") ||
    name.includes("meat") ||
    name.includes("chicken")
  ) {
    return { min: 0, max: 4 };
  }

  if (
    name.includes("strawberr") ||
    name.includes("vegetable") ||
    name.includes("fruit") ||
    name.includes("produce")
  ) {
    return { min: 0, max: 8 };
  }

  return { min: 0, max: 8 };
}

function classifyTemperature(
  temperature: number,
  min: number,
  max: number
): "Normal" | "Warning" | "Critical" {
  if (temperature < min || temperature > max) {
    const deviation =
      temperature < min ? min - temperature : temperature - max;

    return deviation > 2 ? "Critical" : "Warning";
  }

  return "Normal";
}

function classifyHumidity(
  humidity: number
): "Normal" | "Warning" | "Critical" {
  if (humidity < 30 || humidity > 90) {
    return "Critical";
  }

  if (humidity < 40 || humidity > 80) {
    return "Warning";
  }

  return "Normal";
}

function getShipmentStatus(
  status: "Normal" | "Warning" | "Critical"
) {
  if (status === "Critical") {
    return { status: "Critical", risk: "High" };
  }

  if (status === "Warning") {
    return { status: "Warning", risk: "Medium" };
  }

  return { status: "Healthy", risk: "Low" };
}

// GET: Retrieve historical sensor readings
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get("shipmentId");

    const filter = shipmentId ? { shipmentId } : {};

    const readings = await Reading.find(filter)
      .sort({ recordedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      total: readings.length,
      readings,
    });
  } catch (error) {
    console.error("Monitoring GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch readings." },
      { status: 500 }
    );
  }
}

// POST: Generate readings and synchronize shipment status
export async function POST() {
  try {
    await connectDB();

    const shipments = await Shipment.find({
      status: { $ne: "Delivered" },
    }).lean();

    if (shipments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No active shipments available.",
        },
        { status: 404 }
      );
    }

    const newReadings = shipments.map((shipment) => {
      const baseTemperature = Number.parseFloat(
        String(shipment.temperature).replace(/[^0-9.-]/g, "")
      );

      const baseHumidity = Number.parseFloat(
        String(shipment.humidity).replace(/[^0-9.-]/g, "")
      );

      const temperature = Number(
        (
          (Number.isFinite(baseTemperature) ? baseTemperature : 4) +
          (Math.random() * 1.6 - 0.8)
        ).toFixed(1)
      );

      const humidity = Number(
        (
          (Number.isFinite(baseHumidity) ? baseHumidity : 65) +
          (Math.random() * 6 - 3)
        ).toFixed(1)
      );

      const range = getTemperatureRange(shipment.product);

      const temperatureStatus = classifyTemperature(
        temperature,
        range.min,
        range.max
      );

      const humidityStatus = classifyHumidity(humidity);

      const overallStatus =
        temperatureStatus === "Critical" ||
        humidityStatus === "Critical"
          ? "Critical"
          : temperatureStatus === "Warning" ||
              humidityStatus === "Warning"
            ? "Warning"
            : "Normal";

      return {
        shipmentId: shipment.shipmentId,
        temperature,
        humidity,
        temperatureStatus,
        humidityStatus,
        overallStatus,
        recordedAt: new Date(),
      };
    });

    // Save all sensor readings in MongoDB
    const savedReadings = await Reading.insertMany(newReadings);

    // Synchronize shipment records with their latest readings
    const updates = savedReadings.map((reading) => {
      const shipmentStatus = getShipmentStatus(
        reading.overallStatus
      );

      return {
        updateOne: {
          filter: { shipmentId: reading.shipmentId },
          update: {
            $set: {
              temperature: String(reading.temperature),
              humidity: String(reading.humidity),
              status: shipmentStatus.status,
              risk: shipmentStatus.risk,
            },
          },
        },
      };
    });

    await Shipment.bulkWrite(updates);

    return NextResponse.json(
      {
        success: true,
        message: "Sensor readings generated and shipments updated successfully.",
        total: savedReadings.length,
        readings: savedReadings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Monitoring POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate sensor readings.",
      },
      { status: 500 }
    );
  }
}