import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Shipment from "@/models/Shipment";
import Reading from "@/models/Reading";

// Product-specific temperature ranges.
// These are illustrative project thresholds, not certified food-safety limits.
function getTemperatureRange(product: string) {
  const name = product.toLowerCase();

  if (
    name.includes("frozen") ||
    name.includes("ice cream")
  ) {
    return { min: -25, max: -18 };
  }

  if (
    name.includes("vaccine") ||
    name.includes("medicine")
  ) {
    return { min: 2, max: 8 };
  }

  if (name.includes("dairy")) {
    return { min: 0, max: 5 };
  }

  if (
    name.includes("seafood") ||
    name.includes("fish") ||
    name.includes("meat")
  ) {
    return { min: 0, max: 4 };
  }

  if (
    name.includes("vegetable") ||
    name.includes("fruit") ||
    name.includes("produce")
  ) {
    return { min: 0, max: 8 };
  }

  return { min: 0, max: 8 };
}

// Calculate the temperature deviation for one reading.
function getTemperatureDeviation(
  temperature: number,
  min: number,
  max: number
) {
  if (temperature < min) {
    return min - temperature;
  }

  if (temperature > max) {
    return temperature - max;
  }

  return 0;
}

// Calculate spoilage risk from recent sensor readings.
function calculateRisk(
  readings: any[],
  product: string
) {
  // No sensor data available.
  if (!readings || readings.length === 0) {
    return {
      riskScore: null,
      riskLevel: "Insufficient Data",
      reasons: ["No sensor readings available for this shipment."],
      totalReadings: 0,
      temperatureViolations: 0,
      humidityViolations: 0,
      criticalReadings: 0,
    };
  }

  const range = getTemperatureRange(product);

  let temperatureViolations = 0;
  let humidityViolations = 0;
  let criticalReadings = 0;

  readings.forEach((reading) => {
    const temperature = Number(reading.temperature);
    const humidity = Number(reading.humidity);

    const temperatureDeviation = getTemperatureDeviation(
      temperature,
      range.min,
      range.max
    );

    const temperatureOutsideRange = temperatureDeviation > 0;

    const humidityOutsideRange =
      humidity < 40 || humidity > 80;

    if (temperatureOutsideRange) {
      temperatureViolations++;
    }

    if (humidityOutsideRange) {
      humidityViolations++;
    }

    if (
      reading.overallStatus === "Critical" ||
      temperatureDeviation > 2
    ) {
      criticalReadings++;
    }
  });

  // Calculate percentages of readings with violations.
  const total = readings.length;

  const temperatureViolationRate =
    temperatureViolations / total;

  const humidityViolationRate =
    humidityViolations / total;

  const criticalRate =
    criticalReadings / total;

  // Weighted risk score.
  let riskScore =
    temperatureViolationRate * 40 +
    humidityViolationRate * 20 +
    criticalRate * 40;

  riskScore = Math.min(100, Math.round(riskScore));

  // Determine risk category.
  let riskLevel = "Low";

  if (riskScore >= 60) {
    riskLevel = "High";
  } else if (riskScore >= 30) {
    riskLevel = "Medium";
  }

  // Explain why the shipment received this score.
  const reasons: string[] = [];

  if (temperatureViolations > 0) {
    reasons.push(
      `${temperatureViolations} of ${total} readings were outside the temperature range (${range.min}°C to ${range.max}°C).`
    );
  }

  if (humidityViolations > 0) {
    reasons.push(
      `${humidityViolations} of ${total} readings had humidity outside the 40%–80% range.`
    );
  }

  if (criticalReadings > 0) {
    reasons.push(
      `${criticalReadings} readings showed critical environmental conditions.`
    );
  }

  if (reasons.length === 0) {
    reasons.push(
      "All available readings were within the configured environmental ranges."
    );
  }

  return {
    riskScore,
    riskLevel,
    reasons,
    totalReadings: total,
    temperatureViolations,
    humidityViolations,
    criticalReadings,
    temperatureRange: range,
  };
}

// GET: Calculate spoilage risk for all active shipments.
export async function GET() {
  try {
    await connectDB();

    // Fetch shipments that have not been delivered.
    const shipments = await Shipment.find({
      status: { $ne: "Delivered" },
    }).lean();

    const results = [];

    for (const shipment of shipments) {
      // Fetch the latest 20 readings for this shipment.
      const readings = await Reading.find({
        shipmentId: shipment.shipmentId,
      })
        .sort({ recordedAt: -1 })
        .limit(20)
        .lean();

      const risk = calculateRisk(
        readings as any[],
        shipment.product
      );

      results.push({
        shipmentId: shipment.shipmentId,
        product: shipment.product,
        origin: shipment.origin,
        destination: shipment.destination,
        currentTemperature: shipment.temperature,
        currentHumidity: shipment.humidity,
        shipmentStatus: shipment.status,
        ...risk,
      });
    }

    // Calculate summary statistics.
    const summary = {
      totalShipments: results.length,

      lowRisk: results.filter(
        (item) => item.riskLevel === "Low"
      ).length,

      mediumRisk: results.filter(
        (item) => item.riskLevel === "Medium"
      ).length,

      highRisk: results.filter(
        (item) => item.riskLevel === "High"
      ).length,

      insufficientData: results.filter(
        (item) => item.riskLevel === "Insufficient Data"
      ).length,
    };

    return NextResponse.json({
      success: true,
      message: "Spoilage risk calculated successfully.",
      summary,
      results,
    });
  } catch (error) {
    console.error("SPOILAGE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to calculate spoilage risk.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}