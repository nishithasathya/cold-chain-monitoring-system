"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
};

const navigation = [
  { name: "Overview", icon: "▦", href: "/" },
  { name: "Shipments", icon: "▣", href: "/shipments" },
  { name: "Live Monitoring", icon: "◉", href: "/monitoring" },
  { name: "Spoilage Detection", icon: "⚠", href: "/spoilage" },
  { name: "Alerts", icon: "♧", href: "/alerts" },
  { name: "Analytics", icon: "▥", href: "/analytics" },
];

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  async function fetchShipments() {
    try {
      setError("");

      const response = await fetch("/api/shipments", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load shipments");
      }

      setShipments(data.shipments);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load shipment data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Set the date after mounting to avoid Next.js prerendering errors.
    setCurrentDate(
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date())
    );

    fetchShipments();

    const interval = setInterval(fetchShipments, 15000);

    return () => clearInterval(interval);
  }, []);

  const activeShipments = shipments.filter(
    (s) => s.status !== "Delivered"
  );

  const activeAlerts = shipments.filter((s) =>
    ["Warning", "Critical", "At Risk"].includes(s.status)
  );

  const highRiskShipments = shipments.filter(
    (s) => s.risk === "High"
  );

  const averageTemperature =
    activeShipments.length > 0
      ? (
          activeShipments.reduce(
            (total, s) =>
              total + (parseFloat(s.temperature) || 0),
            0
          ) / activeShipments.length
        ).toFixed(1)
      : "0.0";

  const statistics = [
    {
      label: "Total Shipments",
      value: shipments.length.toString(),
      change: "Stored in database",
      icon: "▣",
      color: "#e9f1ff",
      iconColor: "#3979d8",
    },
    {
      label: "Active Shipments",
      value: activeShipments.length.toString(),
      change: "Currently not delivered",
      icon: "↗",
      color: "#e5f8f0",
      iconColor: "#19a879",
    },
    {
      label: "Active Alerts",
      value: activeAlerts.length.toString(),
      change: "Requires attention",
      icon: "⚠",
      color: "#fff2e5",
      iconColor: "#e99a36",
    },
    {
      label: "High Spoilage Risk",
      value: highRiskShipments.length.toString(),
      change: "Immediate intervention",
      icon: "◉",
      color: "#ffe9eb",
      iconColor: "#e45b68",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#172337] flex">

      {/* SIDEBAR */}

      <aside className="w-[250px] bg-[#101d32] text-white flex flex-col min-h-screen fixed left-0 top-0 bottom-0 z-20">

        <div className="px-7 py-8 border-b border-white/10">
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-[#19b887] rounded-xl flex items-center justify-center text-xl">
              ❄
            </div>

            <div>
              <h1 className="font-bold text-lg tracking-wide">
                ColdTrack
              </h1>

              <p className="text-[10px] text-gray-400 tracking-[2px]">
                INTELLIGENT MONITORING
              </p>
            </div>

          </div>
        </div>

        <div className="px-7 pt-8 pb-3">
          <p className="text-[10px] tracking-[2px] text-gray-500 font-semibold">
            WORKSPACE
          </p>
        </div>

        {/* NAVIGATION */}

        <nav className="px-4 space-y-2 flex-1">

          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-[#19b887] text-white shadow-lg"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            );
          })}

        </nav>

        {/* SYSTEM STATUS */}

        <div className="p-5 border-t border-white/10">

          <div className="bg-white/5 rounded-xl p-4">

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>

              <span className="text-xs text-green-400">
                System Operational
              </span>
            </div>

            <p className="text-xs text-gray-400">
              ColdTrack Monitoring System
            </p>

            <p className="text-[10px] text-gray-600 mt-2">
              Version 1.0.0
            </p>

          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="ml-[250px] flex-1 min-w-0">

        {/* TOP BAR */}

        <header className="h-[75px] bg-white border-b border-gray-200 flex items-center justify-between px-9">

          <div>
            <p className="text-xs text-gray-400">
              Workspace / Overview
            </p>

            <h2 className="font-semibold text-lg">
              Overview
            </h2>
          </div>

          <div className="flex items-center gap-6">

            <button
              onClick={() => router.push("/alerts")}
              className="relative text-xl hover:text-[#19b887]"
              title="View alerts"
            >
              ♧

              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">

              <div className="w-9 h-9 rounded-full bg-[#d9f5eb] text-[#15966e] flex items-center justify-center font-bold">
                N
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Administrator
                </p>

                <p className="text-xs text-gray-400">
                  System Admin
                </p>
              </div>

            </div>

          </div>

        </header>

        {/* DASHBOARD */}

        <div className="p-9">

          {/* WELCOME */}

          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">

            <div>
              <h1 className="text-2xl font-bold">
                Cold Chain Overview
              </h1>

              <p className="text-sm text-gray-400 mt-2">
                Monitor shipments, environmental conditions and spoilage risks.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500">
                ◷ {currentDate || "Loading date..."}
              </div>

              <button
                onClick={() => router.push("/shipments")}
                className="bg-[#19b887] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[#159b73] transition"
              >
                + Add Shipment
              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}

              <button
                onClick={fetchShipments}
                className="ml-3 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* STATISTICS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            {statistics.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
              >

                <div className="flex justify-between items-center mb-5">

                  <p className="text-xs text-gray-500">
                    {stat.label}
                  </p>

                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: stat.color,
                      color: stat.iconColor,
                    }}
                  >
                    {stat.icon}
                  </div>

                </div>

                <h2 className="text-3xl font-bold">
                  {loading ? "—" : stat.value}
                </h2>

                <p className="text-xs text-gray-400 mt-2">
                  {stat.change}
                </p>

              </div>
            ))}

          </div>

          {/* MONITORING + ALERTS */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">

            {/* TEMPERATURE */}

            <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">

              <div className="flex justify-between items-center mb-6">

                <div>
                  <h3 className="font-bold">
                    Environmental Monitoring
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">
                    Average temperature across active shipments
                  </p>
                </div>

                <button
                  onClick={() => router.push("/monitoring")}
                  className="text-xs bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100"
                >
                  ● Monitoring →
                </button>

              </div>

              <div className="flex items-end gap-3 mb-6">

                <h2 className="text-4xl font-bold">
                  {loading ? "—" : `${averageTemperature}°C`}
                </h2>

                <p className="text-xs text-green-600 mb-2">
                  Average recorded temperature
                </p>

              </div>

              <div className="h-[160px] flex items-end gap-3 border-b border-l border-gray-200 px-3">

                {shipments.length > 0
                  ? shipments.slice(0, 16).map((shipment) => {
                      const temp = Math.abs(
                        parseFloat(shipment.temperature) || 0
                      );

                      const height = Math.min(
                        90,
                        Math.max(15, temp * 5)
                      );

                      return (
                        <div
                          key={shipment._id}
                          title={`${shipment.product}: ${shipment.temperature}°C`}
                          className={`flex-1 rounded-t-sm transition-all ${
                            shipment.status === "Critical" ||
                            shipment.status === "At Risk"
                              ? "bg-red-500"
                              : shipment.status === "Warning"
                              ? "bg-orange-400"
                              : "bg-[#20b98a]"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })
                  : [42, 58, 48, 65, 55, 73, 62, 45, 58, 68, 52, 60].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-gray-200 rounded-t-sm"
                          style={{ height: `${height}%` }}
                        />
                      )
                    )}

              </div>

              <div className="flex justify-between text-[10px] text-gray-400 mt-3">
                <span>Shipment 1</span>
                <span>Shipment 2</span>
                <span>Shipment 3</span>
                <span>Shipment 4</span>
              </div>

            </div>

            {/* ALERTS */}

            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">

              <div className="flex justify-between mb-6">

                <h3 className="font-bold">
                  Recent Alerts
                </h3>

                <button
                  onClick={() => router.push("/alerts")}
                  className="text-xs text-[#19a879] hover:underline"
                >
                  {activeAlerts.length} active →
                </button>

              </div>

              <div className="space-y-5">

                {activeAlerts.slice(0, 4).map((shipment) => {

                  const isCritical =
                    shipment.status === "Critical" ||
                    shipment.status === "At Risk";

                  return (
                    <div key={shipment._id} className="flex gap-3">

                      <div
                        className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isCritical
                            ? "bg-red-100 text-red-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        !
                      </div>

                      <div>
                        <p className="text-xs font-semibold">
                          {shipment.status} Shipment
                        </p>

                        <p className="text-[10px] text-gray-400 mt-1">
                          {shipment.shipmentId}
                        </p>

                        <p className="text-[10px] text-gray-400 mt-1">
                          Temperature: {shipment.temperature}°C
                        </p>
                      </div>

                    </div>
                  );
                })}

                {!loading && activeAlerts.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No active alerts. All shipments are looking good.
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* SHIPMENTS TABLE */}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">

            <div className="p-6 flex justify-between items-center">

              <div>
                <h3 className="font-bold">
                  Shipment Monitoring
                </h3>

                <p className="text-xs text-gray-400 mt-1">
                  Environmental conditions across tracked shipments
                </p>
              </div>

              <button
                onClick={() => router.push("/shipments")}
                className="text-xs text-[#19a879] font-semibold hover:underline"
              >
                View all shipments →
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
                        {shipment.humidity || "N/A"}%
                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`text-[10px] font-semibold px-3 py-1.5 rounded-full ${
                            shipment.status === "Healthy"
                              ? "bg-green-50 text-green-600"
                              : shipment.status === "Warning" ||
                                shipment.status === "At Risk"
                              ? "bg-orange-50 text-orange-600"
                              : shipment.status === "Delivered"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {shipment.status}
                        </span>

                      </td>

                      <td className="px-4 py-5">

                        <span
                          className={`text-[10px] font-semibold ${
                            shipment.risk === "Low"
                              ? "text-green-600"
                              : shipment.risk === "Medium"
                              ? "text-orange-500"
                              : "text-red-500"
                          }`}
                        >
                          ● {shipment.risk}
                        </span>

                      </td>

                    </tr>

                  ))}

                  {!loading && shipments.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-gray-400"
                      >
                        No shipments found. Add your first shipment to get started.
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-sm text-gray-400"
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
                : `Showing ${shipments.length} database shipments`}
            </div>

          </div>

          {/* FOOTER */}

          <footer className="mt-8 flex justify-between text-[10px] text-gray-400">
            <p>ColdTrack © 2026. Cold Chain Monitoring System.</p>
            <p>Database: MongoDB Atlas</p>
          </footer>

        </div>

      </main>

    </div>
  );
}