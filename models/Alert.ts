import mongoose, { Schema, models, model } from "mongoose";

const AlertSchema = new Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    severity: {
      type: String,
      enum: ["Warning", "Critical"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Resolved"],
      default: "Open",
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Recompile the model instead of reusing an outdated cached schema.
if (mongoose.models.Alert) {
  delete mongoose.models.Alert;
}

const Alert = model("Alert", AlertSchema);

export default Alert;