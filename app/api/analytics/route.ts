import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import Reading from "@/models/Reading";

export async function GET() {
  try {
    await connectDB();

    const shipments = await Shipment.find({}).lean();

    const latestReadings = await Reading.find({})
      .sort({ recordedAt: -1 })
      .limit(100)
      .lean();

    // Oldest to newest for the temperature graph
    const readings = [...latestReadings].reverse();

    const totalShipments = shipments.length;

    const delivered = shipments.filter(
      (s: any) => s.status === "Delivered"
    ).length;

    const active = totalShipments - delivered;

    const normal = readings.filter(
      (r: any) => r.overallStatus === "Normal"
    ).length;

    const warning = readings.filter(
      (r: any) => r.overallStatus === "Warning"
    ).length;

    const critical = readings.filter(
      (r: any) => r.overallStatus === "Critical"
    ).length;

    const temperatures = readings
      .map((r: any) => Number(r.temperature))
      .filter(Number.isFinite);

    const humidities = readings
      .map((r: any) => Number(r.humidity))
      .filter(Number.isFinite);

    const averageTemperature =
      temperatures.length > 0
        ? Number(
            (
              temperatures.reduce((a, b) => a + b, 0) /
              temperatures.length
            ).toFixed(2)
          )
        : 0;

    const averageHumidity =
      humidities.length > 0
        ? Number(
            (
              humidities.reduce((a, b) => a + b, 0) /
              humidities.length
            ).toFixed(2)
          )
        : 0;

    const recentReadings = readings.map((r: any) => ({
      shipmentId: r.shipmentId,
      temperature: Number(r.temperature),
      humidity: Number(r.humidity),
      status: r.overallStatus,
      recordedAt: r.recordedAt,
    }));

    return NextResponse.json({
      success: true,

      summary: {
        totalShipments,
        active,
        delivered,
        totalReadings: readings.length,
        normal,
        warning,
        critical,
        averageTemperature,
        averageHumidity,
      },

      recentReadings,
    });

  } catch (error) {
    console.error("ANALYTICS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}