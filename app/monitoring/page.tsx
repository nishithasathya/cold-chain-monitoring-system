"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Reading = {
  _id: string;
  shipmentId: string;
  temperature: number;
  humidity: number;
  temperatureStatus: string;
  humidityStatus: string;
  overallStatus: string;
  recordedAt: string;
};

export default function MonitoringPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchReadings() {
    try {
      const response = await fetch("/api/monitoring", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch readings.");
      }

      setReadings(data.readings);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch readings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateReadings() {
    try {
      setGenerating(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/monitoring", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to generate readings.");
      }

      setMessage(
        `${data.total} simulated sensor readings saved successfully!`
      );

      await fetchReadings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate readings."
      );
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    fetchReadings();

    const interval = setInterval(fetchReadings, 5000);

    return () => clearInterval(interval);
  }, []);

  const latestReadings = Array.from(
    new Map(readings.map((reading) => [reading.shipmentId, reading])).values()
  );

  const normalCount = latestReadings.filter(
    (r) => r.overallStatus === "Normal"
  ).length;

  const warningCount = latestReadings.filter(
    (r) => r.overallStatus === "Warning"
  ).length;

  const criticalCount = latestReadings.filter(
    (r) => r.overallStatus === "Critical"
  ).length;

  function statusStyle(status: string) {
    if (status === "Normal") {
      return "bg-green-50 text-green-700";
    }

    if (status === "Warning") {
      return "bg-orange-50 text-orange-700";
    }

    return "bg-red-50 text-red-700";
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#172337]">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-200 px-8 py-6">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#19b887] mb-6"
        >
          <span className="text-2xl">←</span>
          Back to Dashboard
        </Link>

        <div className="flex flex-wrap justify-between items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold">
              Live Monitoring
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Monitor temperature and humidity across active shipments.
            </p>
          </div>

          <button
            onClick={generateReadings}
            disabled={generating}
            className="bg-[#19b887] hover:bg-[#159b73] disabled:opacity-50 text-white px-5 py-3 rounded-lg text-sm font-semibold"
          >
            {generating ? "Generating..." : "↻ Generate Sensor Readings"}
          </button>

        </div>

      </header>

      <main className="p-8">

        {/* SIMULATION NOTICE */}

        <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 mb-8 text-sm">
          <strong>Simulation mode:</strong> Sensor readings are currently
          generated using simulated data. Each generated reading is saved
          permanently in MongoDB. Physical IoT sensors are not connected.
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="bg-red-50 text-red-600 rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-6 text-sm">
            {message}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Readings Stored
            </p>
            <h2 className="text-3xl font-bold mt-3">
              {loading ? "—" : readings.length}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Normal
            </p>
            <h2 className="text-3xl font-bold mt-3 text-green-600">
              {normalCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Warning
            </p>
            <h2 className="text-3xl font-bold mt-3 text-orange-500">
              {warningCount}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Critical
            </p>
            <h2 className="text-3xl font-bold mt-3 text-red-500">
              {criticalCount}
            </h2>
          </div>

        </div>

        {/* LATEST SENSOR READINGS */}

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8">

          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg">
              Latest Shipment Conditions
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Most recent recorded reading for each shipment.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#f8fafc] text-gray-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-4 py-4">Temperature</th>
                  <th className="px-4 py-4">Humidity</th>
                  <th className="px-4 py-4">Temperature Status</th>
                  <th className="px-4 py-4">Humidity Status</th>
                  <th className="px-4 py-4">Overall Status</th>
                  <th className="px-4 py-4">Recorded At</th>
                </tr>
              </thead>

              <tbody>

                {latestReadings.map((reading) => (

                  <tr
                    key={reading._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >

                    <td className="px-6 py-5 text-xs font-semibold text-blue-600">
                      {reading.shipmentId}
                    </td>

                    <td className="px-4 py-5 text-xs font-semibold">
                      {reading.temperature}°C
                    </td>

                    <td className="px-4 py-5 text-xs">
                      {reading.humidity}%
                    </td>

                    <td className="px-4 py-5">
                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-semibold ${statusStyle(reading.temperatureStatus)}`}>
                        {reading.temperatureStatus}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-semibold ${statusStyle(reading.humidityStatus)}`}>
                        {reading.humidityStatus}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <span className={`text-[10px] px-3 py-1.5 rounded-full font-semibold ${statusStyle(reading.overallStatus)}`}>
                        {reading.overallStatus}
                      </span>
                    </td>

                    <td className="px-4 py-5 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(reading.recordedAt)}
                    </td>

                  </tr>

                ))}

                {!loading && latestReadings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                      No readings yet. Click Generate Sensor Readings to begin.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">
                      Loading sensor data...
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* READING HISTORY */}

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">

          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg">
              Sensor Reading History
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Historical temperature and humidity readings stored in MongoDB.
              Showing the latest 100 records.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#f8fafc] text-gray-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-4 py-4">Temperature</th>
                  <th className="px-4 py-4">Humidity</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Timestamp</th>
                </tr>
              </thead>

              <tbody>

                {readings.map((reading) => (

                  <tr
                    key={reading._id}
                    className="border-t border-gray-100"
                  >

                    <td className="px-6 py-4 text-xs font-semibold">
                      {reading.shipmentId}
                    </td>

                    <td className="px-4 py-4 text-xs">
                      {reading.temperature}°C
                    </td>

                    <td className="px-4 py-4 text-xs">
                      {reading.humidity}%
                    </td>

                    <td className="px-4 py-4">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-semibold ${statusStyle(reading.overallStatus)}`}>
                        {reading.overallStatus}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(reading.recordedAt)}
                    </td>

                  </tr>

                ))}

                {!loading && readings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                      No historical readings available.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        <footer className="mt-8 flex justify-between text-xs text-gray-400">
          <p>ColdTrack © 2026</p>
          <p>Sensor Database: MongoDB Atlas</p>
        </footer>

      </main>

    </div>
  );
}