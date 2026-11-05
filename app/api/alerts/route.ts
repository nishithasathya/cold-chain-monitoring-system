import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Alert from "@/models/Alert";
import Reading from "@/models/Reading";

// GET: Fetch all alerts
export async function GET() {
  try {
    await connectDB();

    const alerts = await Alert.find()
      .sort({ triggeredAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      total: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Alerts GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch alerts.",
      },
      { status: 500 }
    );
  }
}

// POST: Generate alerts from latest sensor readings
export async function POST() {
  try {
    await connectDB();

    const latestReadings = await Reading.aggregate([
      { $sort: { recordedAt: -1 } },
      {
        $group: {
          _id: "$shipmentId",
          reading: { $first: "$$ROOT" },
        },
      },
    ]);

    let generated = 0;
    let resolved = 0;
    let updated = 0;

    for (const item of latestReadings) {
      const reading = item.reading;

      const isUnsafe =
        reading.overallStatus === "Warning" ||
        reading.overallStatus === "Critical";

      if (isUnsafe) {
        const severity = reading.overallStatus;

        const message =
          `${severity} environmental condition detected. ` +
          `Temperature: ${reading.temperature}°C, ` +
          `Humidity: ${reading.humidity}%.`;

        // Find any existing alert for this shipment,
        // regardless of whether it is Open or Resolved.
        const existingAlert = await Alert.findOne({
          shipmentId: reading.shipmentId,
        });

        if (existingAlert) {
          const wasResolved = existingAlert.status === "Resolved";

          existingAlert.severity = severity;
          existingAlert.message = message;
          existingAlert.status = "Open";
          existingAlert.resolvedAt = null;
          existingAlert.triggeredAt = new Date();

          await existingAlert.save();

          if (wasResolved) {
            generated++;
          } else {
            updated++;
          }
        } else {
          await Alert.create({
            shipmentId: reading.shipmentId,
            severity,
            message,
            status: "Open",
            triggeredAt: new Date(),
          });

          generated++;
        }
      } else {
        const result = await Alert.updateMany(
          {
            shipmentId: reading.shipmentId,
            status: "Open",
          },
          {
            $set: {
              status: "Resolved",
              resolvedAt: new Date(),
            },
          }
        );

        resolved += result.modifiedCount;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Alert check completed successfully.",
      generated,
      updated,
      resolved,
      shipmentsChecked: latestReadings.length,
    });
  } catch (error) {
    console.error("Alerts POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate alerts.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH: Manually resolve an alert
export async function PATCH(request: Request) {
  try {
    await connectDB();

    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json(
        {
          success: false,
          message: "Alert ID is required.",
        },
        { status: 400 }
      );
    }

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        $set: {
          status: "Resolved",
          resolvedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!alert) {
      return NextResponse.json(
        {
          success: false,
          message: "Alert not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Alert resolved successfully.",
      alert,
    });
  } catch (error) {
    console.error("Alert PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to resolve alert.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}