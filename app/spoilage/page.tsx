"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Result = {
  shipmentId: string;
  product: string;
  origin: string;
  destination: string;
  currentTemperature: string;
  currentHumidity: string;
  shipmentStatus: string;
  riskScore: number | null;
  riskLevel: string;
  reasons: string[];
  totalReadings: number;
  temperatureViolations: number;
  humidityViolations: number;
  criticalReadings: number;
  temperatureRange?: {
    min: number;
    max: number;
  };
};

type DetectionData = {
  success: boolean;
  message: string;
  summary: {
    totalShipments: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    insufficientData: number;
  };
  results: Result[];
};

export default function SpoilagePage() {
  const [data, setData] = useState<DetectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function runDetection() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/spoilage", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Detection failed");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to run spoilage detection."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runDetection();
  }, []);

  function getStatusStyle(status: string) {
    switch (status) {
      case "Low":
        return "bg-green-50 text-green-700";

      case "Medium":
        return "bg-orange-50 text-orange-700";

      case "High":
        return "bg-red-50 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  function getProgressStyle(status: string) {
    switch (status) {
      case "Low":
        return "bg-green-500";

      case "Medium":
        return "bg-orange-500";

      case "High":
        return "bg-red-500";

      default:
        return "bg-gray-400";
    }
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

        <div className="flex justify-between items-center flex-wrap gap-4">

          <div>
            <h1 className="text-2xl font-bold">
              Spoilage Detection
            </h1>

            <p className="text-sm text-gray-400 mt-2">
              Identify shipments with potentially unsafe environmental conditions.
            </p>
          </div>

          <button
            onClick={runDetection}
            disabled={loading}
            className="bg-[#19b887] hover:bg-[#159b73] disabled:opacity-50 text-white px-5 py-3 rounded-lg text-sm font-semibold"
          >
            {loading ? "Analyzing..." : "↻ Run Detection"}
          </button>

        </div>

      </header>

      <main className="p-8 max-w-[1600px] mx-auto">

        {/* DISCLAIMER */}

        <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 mb-8 text-sm">
          <strong>Demo detection:</strong> This system calculates a
          rule-based environmental risk score using recent sensor readings.
          The configured thresholds are illustrative project rules, not
          validated food or pharmaceutical safety standards. The score
          does not establish whether a product has actually spoiled.
        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Analyzed</p>
            <h2 className="text-3xl font-bold mt-3">
              {loading ? "—" : data?.summary.totalShipments ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Low Risk</p>
            <h2 className="text-3xl font-bold mt-3 text-green-600">
              {loading ? "—" : data?.summary.lowRisk ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Medium Risk</p>
            <h2 className="text-3xl font-bold mt-3 text-orange-500">
              {loading ? "—" : data?.summary.mediumRisk ?? 0}
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">High Risk</p>
            <h2 className="text-3xl font-bold mt-3 text-red-500">
              {loading ? "—" : data?.summary.highRisk ?? 0}
            </h2>
          </div>

        </div>

        {/* INSUFFICIENT DATA */}

        {data && data.summary.insufficientData > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-8 text-sm">
            {data.summary.insufficientData} shipment(s) do not have sensor
            readings available. Their spoilage risk cannot currently be assessed.
          </div>
        )}

        {/* DETECTION RESULTS */}

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm">

          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg">
              Spoilage Risk Assessment
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Risk scores are calculated from the latest 20 sensor readings per shipment.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#f8fafc] text-gray-400 text-[10px] uppercase tracking-wider">

                <tr>
                  <th className="px-6 py-4">Shipment</th>
                  <th className="px-4 py-4">Product</th>
                  <th className="px-4 py-4">Temperature</th>
                  <th className="px-4 py-4">Humidity</th>
                  <th className="px-4 py-4">Risk Score</th>
                  <th className="px-4 py-4">Risk Level</th>
                </tr>

              </thead>

              <tbody>

                {data?.results.map((shipment) => (

                  <tr
                    key={shipment.shipmentId}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >

                    <td className="px-6 py-5 text-xs font-semibold text-[#3979d8]">
                      {shipment.shipmentId}
                    </td>

                    <td className="px-4 py-5 text-xs font-medium">
                      {shipment.product}
                      <p className="text-gray-400 mt-1 font-normal">
                        {shipment.origin} → {shipment.destination}
                      </p>
                    </td>

                    <td className="px-4 py-5 text-xs font-semibold">
                      {shipment.currentTemperature}°C
                    </td>

                    <td className="px-4 py-5 text-xs">
                      {shipment.currentHumidity}%
                    </td>

                    <td className="px-4 py-5 text-xs font-semibold">
                      {shipment.riskScore !== null
                        ? `${shipment.riskScore}/100`
                        : "N/A"}
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`text-[10px] font-semibold px-3 py-1.5 rounded-full ${getStatusStyle(
                          shipment.riskLevel
                        )}`}
                      >
                        {shipment.riskLevel}
                      </span>
                    </td>

                  </tr>

                ))}

                {!loading && data?.results.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No active shipments available. Add a shipment first.
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                      Analyzing shipment conditions...
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* RISK BREAKDOWN */}

        <section className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-6">

          <h2 className="font-bold text-lg mb-2">
            Individual Shipment Analysis
          </h2>

          <p className="text-sm text-gray-400 mb-6">
            Environmental violations and explanations behind each risk score.
          </p>

          <div className="space-y-6">

            {data?.results.map((shipment) => (

              <div
                key={shipment.shipmentId}
                className="border border-gray-100 rounded-xl p-5"
              >

                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">

                  <div>
                    <h3 className="font-semibold text-sm">
                      {shipment.product}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {shipment.shipmentId}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusStyle(
                      shipment.riskLevel
                    )}`}
                  >
                    {shipment.riskLevel} Risk
                  </span>

                </div>

                {/* SCORE */}

                <div className="mb-5">

                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-500">
                      Environmental Risk Score
                    </span>

                    <span className="font-semibold">
                      {shipment.riskScore !== null
                        ? `${shipment.riskScore}/100`
                        : "Insufficient data"}
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 rounded-full h-2.5">

                    <div
                      className={`h-2.5 rounded-full transition-all ${getProgressStyle(
                        shipment.riskLevel
                      )}`}
                      style={{
                        width: `${shipment.riskScore ?? 0}%`,
                      }}
                    />

                  </div>

                </div>

                {/* METRICS */}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400">
                      Total Readings
                    </p>
                    <p className="font-bold text-lg mt-1">
                      {shipment.totalReadings}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400">
                      Temperature Violations
                    </p>
                    <p className="font-bold text-lg mt-1">
                      {shipment.temperatureViolations}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400">
                      Humidity Violations
                    </p>
                    <p className="font-bold text-lg mt-1">
                      {shipment.humidityViolations}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400">
                      Critical Readings
                    </p>
                    <p className="font-bold text-lg mt-1">
                      {shipment.criticalReadings}
                    </p>
                  </div>

                </div>

                {/* REASONS */}

                <div>
                  <p className="text-xs font-semibold mb-2">
                    Detection Explanation
                  </p>

                  <ul className="space-y-2">
                    {shipment.reasons.map((reason, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-500 flex gap-2"
                      >
                        <span className="text-[#19b887]">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            ))}

          </div>

        </section>

        <footer className="mt-8 flex justify-between text-xs text-gray-400">
          <p>ColdTrack © 2026</p>
          <p>Detection Engine: Rule-Based Environmental Risk Analysis</p>
        </footer>

      </main>

    </div>
  );
}