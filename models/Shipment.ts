import mongoose, { Schema, models, model } from "mongoose";

const ShipmentSchema = new Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },

    product: {
      type: String,
      required: true,
    },

    origin: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    temperature: {
      type: String,
      required: true,
    },

    humidity: {
      type: String,
      default: "N/A",
    },

    status: {
      type: String,
      enum: [
        "Healthy",
        "Warning",
        "Critical",
        "In Transit",
        "At Risk",
        "Delivered",
      ],
      default: "In Transit",
    },

    risk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
  },
  {
    timestamps: true,
  }
);

const Shipment =
  models.Shipment || model("Shipment", ShipmentSchema);

export default Shipment;
