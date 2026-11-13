"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Reading = {
  shipmentId: string;
  temperature: number;
  humidity: number;
  status: string;
  recordedAt: string;
};

type AnalyticsData = {
  totalShipments: number;
  active: number;
  delivered: number;
  totalReadings: number;
  normal: number;
  warning: number;
  critical: number;
  averageTemperature: number;
  averageHumidity: number;
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsData | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAnalytics() {
    try {
      setError("");

      const response = await fetch("/api/analytics");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load analytics");
      }

      setSummary(data.summary);
      setReadings(data.recentReadings || []);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Unable to load analytics data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Total Shipments",
      value: summary?.totalShipments ?? 0,
      subtitle: "All registered shipments",
      icon: "▣",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Shipments",
      value: summary?.active ?? 0,
      subtitle: "Currently in transit",
      icon: "↗",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Delivered",
      value: summary?.delivered ?? 0,
      subtitle: "Successfully delivered",
      icon: "✓",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Sensor Readings",
      value: summary?.totalReadings ?? 0,
      subtitle: "Latest 100 stored readings",
      icon: "◉",
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const statusTotal =
    (summary?.normal ?? 0) +
    (summary?.warning ?? 0) +
    (summary?.critical ?? 0);

  const temperaturePoints = readings.slice(-12);

  const chartValues = temperaturePoints.map((r) => r.temperature);

  const minTemp =
    chartValues.length > 0 ? Math.min(...chartValues) - 2 : 0;

  const maxTemp =
    chartValues.length > 0 ? Math.max(...chartValues) + 2 : 10;

  const temperatureCoordinates = temperaturePoints
    .map((reading, index) => {
      const x =
        temperaturePoints.length === 1
          ? 50
          : (index / (temperaturePoints.length - 1)) * 100;

      const y =
        100 -
        ((reading.temperature - minTemp) /
          (maxTemp - minTemp || 1)) *
          85 -
        5;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#172337]">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-200 px-9 py-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-[#19a879] inline-flex items-center gap-2 mb-5"
        >
          <span className="text-xl">←</span>
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Analytics Dashboard
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Insights and performance analysis of your cold chain operations.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="bg-[#19b887] hover:bg-[#159c73] disabled:opacity-50 text-white px-5 py-3 rounded-lg text-sm font-semibold"
          >
            ↻ Refresh Data
          </button>
        </div>
      </header>

      <main className="p-9">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
            <button
              onClick={fetchAnalytics}
              className="ml-3 underline font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-4 gap-5 mb-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${card.color}`}
                >
                  {card.icon}
                </div>
              </div>

              <h2 className="text-3xl font-bold">
                {loading ? "—" : card.value}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                {card.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* ENVIRONMENTAL SUMMARY */}

        <div className="grid grid-cols-2 gap-5 mb-8">

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-2">
              Average Temperature
            </h3>

            <p className="text-sm text-gray-400 mb-5">
              Across the latest stored sensor readings
            </p>

            <h2 className="text-4xl font-bold text-[#3979d8]">
              {loading
                ? "—"
                : `${summary?.averageTemperature ?? 0}°C`}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-lg mb-2">
              Average Humidity
            </h3>

            <p className="text-sm text-gray-400 mb-5">
              Across the latest stored sensor readings
            </p>

            <h2 className="text-4xl font-bold text-[#19a879]">
              {loading
                ? "—"
                : `${summary?.averageHumidity ?? 0}%`}
            </h2>
          </div>

        </div>

        {/* TEMPERATURE TREND */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">

          <div className="mb-6">
            <h3 className="font-bold text-lg">
              Temperature Trend
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Temperature variation across the latest 12 recorded readings.
            </p>
          </div>

          {temperaturePoints.length > 0 ? (
            <>
              <div className="h-[260px] w-full">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  {[20, 40, 60, 80].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                    />
                  ))}

                  <polyline
                    points={temperatureCoordinates}
                    fill="none"
                    stroke="#19b887"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {temperaturePoints.map((reading, index) => {
                    const x =
                      temperaturePoints.length === 1
                        ? 50
                        : (index / (temperaturePoints.length - 1)) *
                          100;

                    const y =
                      100 -
                      ((reading.temperature - minTemp) /
                        (maxTemp - minTemp || 1)) *
                        85 -
                      5;

                    return (
                      <circle
                        key={`${reading.shipmentId}-${index}`}
                        cx={x}
                        cy={y}
                        r="1.5"
                        fill="#19b887"
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-4">
                <span>Older readings</span>
                <span>Latest reading</span>
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
              No sensor readings available. Generate readings in Live Monitoring.
            </div>
          )}

        </div>

        {/* STATUS DISTRIBUTION */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">

          <h3 className="font-bold text-lg">
            Environmental Status Distribution
          </h3>

          <p className="text-sm text-gray-400 mt-1 mb-7">
            Breakdown of the latest stored sensor readings by overall status.
          </p>

          <div className="space-y-6">

            {[
              {
                label: "Normal",
                value: summary?.normal ?? 0,
                color: "bg-green-500",
              },
              {
                label: "Warning",
                value: summary?.warning ?? 0,
                color: "bg-orange-400",
              },
              {
                label: "Critical",
                value: summary?.critical ?? 0,
                color: "bg-red-500",
              },
            ].map((item) => {
              const percentage =
                statusTotal > 0
                  ? (item.value / statusTotal) * 100
                  : 0;

              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">
                      {item.label}
                    </span>

                    <span className="text-gray-500">
                      {loading
                        ? "—"
                        : `${item.value} (${percentage.toFixed(1)}%)`}
                    </span>
                  </div>

                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

          </div>
        </div>

        {/* READING HISTORY */}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="p-6">
            <h3 className="font-bold text-lg">
              Recent Sensor Records
            </h3>

            <p className="text-sm text-gray-400 mt-1">
              Latest readings retrieved from MongoDB.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-[#f8fafc] text-gray-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Shipment ID</th>
                  <th className="px-6 py-4">Temperature</th>
                  <th className="px-6 py-4">Humidity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Recorded At</th>
                </tr>
              </thead>

              <tbody>
                {readings.slice().reverse().map((reading, index) => (
                  <tr
                    key={`${reading.shipmentId}-${reading.recordedAt}-${index}`}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 text-xs font-semibold text-blue-600">
                      {reading.shipmentId}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold">
                      {reading.temperature}°C
                    </td>

                    <td className="px-6 py-5 text-sm">
                      {reading.humidity}%
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-semibold ${
                          reading.status === "Normal"
                            ? "bg-green-50 text-green-600"
                            : reading.status === "Warning"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {reading.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-xs text-gray-500">
                      {new Date(reading.recordedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {!loading && readings.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-sm text-gray-400"
                    >
                      No readings found. Generate sensor readings first.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-sm text-gray-400"
                    >
                      Loading analytics...
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
            Showing {readings.length} stored readings
          </div>

        </div>

        {/* FOOTER */}

        <footer className="mt-8 flex justify-between text-xs text-gray-400">
          <p>ColdTrack © 2026</p>
          <p>Analytics powered by MongoDB Atlas</p>
        </footer>

      </main>
    </div>
  );
}