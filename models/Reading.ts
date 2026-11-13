import mongoose, { Schema, models, model } from "mongoose";

const ReadingSchema = new Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      index: true,
    },

    temperature: {
      type: Number,
      required: true,
    },

    humidity: {
      type: Number,
      required: true,
    },

    temperatureStatus: {
      type: String,
      enum: ["Normal", "Warning", "Critical"],
      default: "Normal",
    },

    humidityStatus: {
      type: String,
      enum: ["Normal", "Warning", "Critical"],
      default: "Normal",
    },

    overallStatus: {
      type: String,
      enum: ["Normal", "Warning", "Critical"],
      default: "Normal",
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Reuse the model if it already exists
const Reading =
  models.Reading || model("Reading", ReadingSchema);

export default Reading;