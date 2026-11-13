"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Clock,
  Check,
  Loader2,
} from "lucide-react";

interface Alert {
  _id: string;
  shipmentId: string;
  severity: "Warning" | "Critical";
  message: string;
  status: "Open" | "Resolved";
  triggeredAt: string;
  resolvedAt?: string | null;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAlerts = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/alerts");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch alerts.");
      }

      setAlerts(data.alerts || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function runAlertCheck() {
    try {
      setChecking(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/alerts", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Alert check failed.");
      }

      setMessage(
        `Alert check completed. ${data.generated} new alert(s) generated and ${data.resolved} alert(s) resolved.`
      );

      await fetchAlerts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to check alerts."
      );
    } finally {
      setChecking(false);
    }
  }

  async function resolveAlert(alertId: string) {
    try {
      setResolving(alertId);
      setError("");
      setMessage("");

      const response = await fetch("/api/alerts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alertId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to resolve alert.");
      }

      setMessage("Alert resolved successfully.");
      await fetchAlerts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resolve alert."
      );
    } finally {
      setResolving(null);
    }
  }

  const openAlerts = alerts.filter(
    (alert) => alert.status === "Open"
  );

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "Resolved"
  );

  const criticalAlerts = openAlerts.filter(
    (alert) => alert.severity === "Critical"
  );

  const warningAlerts = openAlerts.filter(
    (alert) => alert.severity === "Warning"
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800">
      {/* Header */}
      <header className="flex flex-col gap-5 border-b border-slate-200 bg-white px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={19} />
            Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">
            Alerts Management
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor, review and resolve cold chain alerts.
          </p>
        </div>

        <button
          onClick={runAlertCheck}
          disabled={checking}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checking ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={17} />
          )}
          {checking ? "Checking..." : "Run Alert Check"}
        </button>
      </header>

      <main className="space-y-7 px-6 py-8 md:px-10">
        {/* Information banner */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-800">
          <strong>Automated alerts:</strong> Alerts are generated from the
          latest stored sensor readings. Warning and Critical conditions
          are recorded for review. This project uses illustrative
          monitoring thresholds.
        </div>

        {/* Success message */}
        {message && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Alerts"
            value={alerts.length}
            icon={<Bell size={22} />}
            color="blue"
          />

          <StatCard
            title="Open Alerts"
            value={openAlerts.length}
            icon={<AlertTriangle size={22} />}
            color="orange"
          />

          <StatCard
            title="Critical Alerts"
            value={criticalAlerts.length}
            icon={<ShieldAlert size={22} />}
            color="red"
          />

          <StatCard
            title="Resolved Alerts"
            value={resolvedAlerts.length}
            icon={<CheckCircle2 size={22} />}
            color="green"
          />
        </section>

        {/* Alert summary */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <AlertTriangle size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Warning Alerts</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Conditions requiring attention
                </p>
              </div>
            </div>

            <p className="mt-5 text-4xl font-bold text-orange-500">
              {warningAlerts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-500">
                <ShieldAlert size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Critical Alerts</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Conditions requiring urgent attention
                </p>
              </div>
            </div>

            <p className="mt-5 text-4xl font-bold text-red-500">
              {criticalAlerts.length}
            </p>
          </div>
        </section>

        {/* Alerts table */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-6 py-6">
            <h2 className="text-xl font-bold">Alert History</h2>
            <p className="text-sm text-slate-400">
              All alerts generated from stored sensor readings.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={22} />
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 rounded-full bg-emerald-50 p-5 text-emerald-500">
                <CheckCircle2 size={35} />
              </div>

              <h3 className="text-lg font-semibold">
                No alerts generated yet
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-400">
                Generate sensor readings in Live Monitoring, then click
                Run Alert Check to identify environmental warnings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Shipment ID</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Triggered At</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <tr
                      key={alert._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5 font-semibold text-blue-600">
                        {alert.shipmentId}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            alert.severity === "Critical"
                              ? "bg-red-50 text-red-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>

                      <td className="max-w-sm px-6 py-5 text-sm text-slate-600">
                        {alert.message}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                        {formatDate(alert.triggeredAt)}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            alert.status === "Open"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {alert.status === "Open" ? (
                          <button
                            onClick={() => resolveAlert(alert._id)}
                            disabled={resolving === alert._id}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {resolving === alert._id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={15} />
                            )}
                            Resolve
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-400">
            Showing {alerts.length} stored alert(s)
          </div>
        </section>

        {/* Footer note */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Clock size={16} />
          Alert information is stored permanently in MongoDB Atlas.
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "orange" | "red" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <div className={`rounded-xl p-3 ${colors[color]}`}>
          {icon}
        </div>
      </div>

      <p className="mt-5 text-4xl font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}