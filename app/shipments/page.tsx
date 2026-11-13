"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Shipment = {
  _id: string;
  shipmentId: string;
  product: string;
  origin: string;
  destination: string;
  temperature: string;
  humidity: string;
  status: string;
  risk: string;
  createdAt?: string;
};

const emptyForm = {
  product: "",
  origin: "",
  destination: "",
  temperature: "",
  humidity: "",
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);

  // FETCH SHIPMENTS

  async function fetchShipments() {
    try {
      setError("");

      const response = await fetch("/api/shipments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch shipments");
      }

      setShipments(data.shipments);
    } catch (err) {
      console.error("Shipment fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load shipments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShipments();

    const interval = setInterval(fetchShipments, 15000);

    return () => clearInterval(interval);
  }, []);

  // HANDLE FORM INPUTS

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ADD SHIPMENT

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: form.product.trim(),
          origin: form.origin.trim(),
          destination: form.destination.trim(),
          temperature: form.temperature.trim(),
          humidity: form.humidity.trim() || "N/A",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add shipment");
      }

      setSuccess("Shipment added successfully!");
      setForm(emptyForm);
      setShowForm(false);

      await fetchShipments();
    } catch (err) {
      console.error("Add shipment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add shipment."
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE SHIPMENT

  async function handleDelete(shipmentId: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete shipment ${shipmentId}?`
    );

    if (!confirmed) return;

    try {
      setDeleting(shipmentId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/shipments?shipmentId=${encodeURIComponent(shipmentId)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete shipment");
      }

      setSuccess("Shipment deleted successfully.");

      await fetchShipments();
    } catch (err) {
      console.error("Delete shipment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete shipment."
      );
    } finally {
      setDeleting("");
    }
  }

  // STATUS STYLING

  function getStatusStyle(status: string) {
    switch (status) {
      case "Healthy":
        return "bg-green-50 text-green-600";

      case "Warning":
        return "bg-orange-50 text-orange-600";

      case "Critical":
      case "At Risk":
        return "bg-red-50 text-red-600";

      case "Delivered":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-blue-50 text-blue-600";
    }
  }

  function getRiskStyle(risk: string) {
    switch (risk) {
      case "Low":
        return "text-green-600";

      case "Medium":
        return "text-orange-500";

      case "High":
        return "text-red-500";

      default:
        return "text-gray-500";
    }
  }

  const activeShipments = shipments.filter(
    (shipment) => shipment.status !== "Delivered"
  );

  const deliveredShipments = shipments.filter(
    (shipment) => shipment.status === "Delivered"
  );

  const highRiskShipments = shipments.filter(
    (shipment) => shipment.risk === "High"
  );

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#172337]">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-200">

        <div className="px-8 py-6">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#19b887] transition-colors mb-6"
          >
            <span className="text-2xl">←</span>
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap justify-between items-center gap-4">

            <div>
              <h1 className="text-2xl font-bold">
                Shipment Management
              </h1>

              <p className="text-sm text-gray-400 mt-2">
                Create, track and manage your cold chain shipments.
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setSuccess("");
              }}
              className="bg-[#19b887] hover:bg-[#159b73] text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              {showForm ? "✕ Close Form" : "+ Add New Shipment"}
            </button>

          </div>

        </div>

      </header>

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* NOTIFICATIONS */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-100 text-green-700 rounded-lg p-4 text-sm">
            {success}
          </div>
        )}

        {/* ADD SHIPMENT FORM */}

        {showForm && (

          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-7 mb-8">

            <div className="mb-6">
              <h2 className="font-bold text-lg">
                Add New Shipment
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Enter the shipment details to register it in ColdTrack.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* PRODUCT */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    placeholder="e.g. Frozen Seafood"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#19b887]"
                  />
                </div>

                {/* ORIGIN */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Origin *
                  </label>

                  <input
                    type="text"
                    name="origin"
                    value={form.origin}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#19b887]"
                  />
                </div>

                {/* DESTINATION */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Destination *
                  </label>

                  <input
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#19b887]"
                  />
                </div>

                {/* TEMPERATURE */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temperature (°C) *
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={form.temperature}
                    onChange={handleChange}
                    placeholder="e.g. 4.5"
                    required
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#19b887]"
                  />
                </div>

                {/* HUMIDITY */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Humidity (%) 
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    name="humidity"
                    value={form.humidity}
                    onChange={handleChange}
                    placeholder="e.g. 75"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#19b887]"
                  />
                </div>

              </div>

              <div className="flex flex-wrap gap-3 mt-7">

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#19b887] hover:bg-[#159b73] disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-semibold transition"
                >
                  {saving ? "Adding Shipment..." : "Save Shipment"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                  }}
                  className="border border-gray-200 hover:bg-gray-50 px-6 py-3 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>

              </div>

            </form>

          </section>

        )}

        {/* STATISTICS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Shipments
            </p>

            <h2 className="text-3xl font-bold mt-3">
              {loading ? "—" : shipments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Registered shipments
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Shipments
            </p>

            <h2 className="text-3xl font-bold mt-3 text-[#19a879]">
              {loading ? "—" : activeShipments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Not yet delivered
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Delivered Shipments
            </p>

            <h2 className="text-3xl font-bold mt-3 text-[#3979d8]">
              {loading ? "—" : deliveredShipments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Successfully delivered
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              High Risk Shipments
            </p>

            <h2 className="text-3xl font-bold mt-3 text-red-500">
              {loading ? "—" : highRiskShipments.length}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Require attention
            </p>
          </div>

        </section>

        {/* SHIPMENT TABLE */}

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">

          <div className="p-6 flex flex-wrap justify-between items-center gap-4">

            <div>
              <h2 className="font-bold text-lg">
                All Shipments
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Shipment records stored in MongoDB Atlas.
              </p>
            </div>

            <button
              onClick={fetchShipments}
              className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm text-gray-600 transition"
            >
              ↻ Refresh
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#f8fafc] text-gray-400 text-[10px] uppercase tracking-wider">

                <tr>
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4">Route</th>
                  <th className="px-4 py-4">Temperature</th>
                  <th className="px-4 py-4">Humidity</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Risk</th>
                  <th className="px-4 py-4">Action</th>
                </tr>

              </thead>

              <tbody>

                {shipments.map((shipment) => (

                  <tr
                    key={shipment._id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >

                    <td className="px-6 py-5 text-xs font-semibold text-[#3979d8]">
                      {shipment.shipmentId}
                    </td>

                    <td className="px-4 py-5 text-xs font-medium">
                      {shipment.product}
                    </td>

                    <td className="px-4 py-5 text-xs text-gray-500">
                      {shipment.origin} → {shipment.destination}
                    </td>

                    <td className="px-4 py-5 text-xs font-semibold">
                      {shipment.temperature}°C
                    </td>

                    <td className="px-4 py-5 text-xs text-gray-500">
                      {shipment.humidity || "N/A"}
                      {shipment.humidity && shipment.humidity !== "N/A"
                        ? "%"
                        : ""}
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`text-[10px] font-semibold px-3 py-1.5 rounded-full ${getStatusStyle(
                          shipment.status
                        )}`}
                      >
                        {shipment.status}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`text-[10px] font-semibold ${getRiskStyle(
                          shipment.risk
                        )}`}
                      >
                        ● {shipment.risk}
                      </span>
                    </td>

                    <td className="px-4 py-5">

                      <button
                        onClick={() => handleDelete(shipment.shipmentId)}
                        disabled={deleting === shipment.shipmentId}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition"
                      >
                        {deleting === shipment.shipmentId
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </td>

                  </tr>

                ))}

                {!loading && shipments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-sm text-gray-400"
                    >
                      No shipments found. Add your first shipment to get started.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-sm text-gray-400"
                    >
                      Loading shipments...
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
            {loading
              ? "Loading database records..."
              : `Showing ${shipments.length} shipment records`}
          </div>

        </section>

        {/* FOOTER */}

        <footer className="mt-8 flex flex-wrap justify-between gap-3 text-[10px] text-gray-400">
          <p>ColdTrack © 2026. Cold Chain Monitoring System.</p>
          <p>Database: MongoDB Atlas</p>
        </footer>

      </main>

    </div>
  );
}