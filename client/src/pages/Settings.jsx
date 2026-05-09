import React, { useEffect, useState } from "react";
import { authApi } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 dark:text-white rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#00d96f] focus:ring-2 focus:ring-[#00d96f]/20 transition";

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [me, setMe] = useState(user);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((data) => {
        if (!cancelled) setMe(data.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      showToast({
        type: "error",
        message: "New password and confirmation don't match.",
      });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast({
        type: "error",
        message: "New password must be at least 6 characters.",
      });
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast({ type: "success", message: "Password updated." });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      showToast({
        type: "error",
        message:
          err.response?.data?.error || "Failed to update password.",
      });
    } finally {
      setPwLoading(false);
    }
  };

  const handleTogglePlan = async () => {
    setPlanLoading(true);
    try {
      const data = await authApi.togglePlan();
      setMe(data.user);
      // Update localStorage user so the rest of the app sees it
      try {
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (_) {
        /* ignore */
      }
      showToast({
        type: "success",
        message: `Plan switched to ${data.user.plan}.`,
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err.response?.data?.error || "Failed to switch plan.",
      });
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-900/40 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your account, password, and plan.
          </p>
        </header>

        {/* Account info */}
        <Card title="Account">
          <Row label="Name" value={me?.name || "—"} />
          <Row label="Email" value={me?.email || "—"} />
          <Row
            label="Plan"
            value={
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#00d96f]/10 text-[#00a350] dark:text-[#00d96f]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00d96f]" />
                {me?.plan || "free"}
              </span>
            }
          />
          {typeof me?.usageCount === "number" && (
            <Row
              label="Usage this month"
              value={
                <span className="text-zinc-700 dark:text-zinc-300">
                  {me.usageCount}
                  {me.usageLimit
                    ? ` / ${me.usageLimit}`
                    : " (unlimited)"}
                </span>
              }
            />
          )}
        </Card>

        {/* Toggle plan (dev) */}
        <Card title="Plan">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            For testing purposes you can toggle between free and premium. Real
            payments via Stripe are coming soon.
          </p>
          <button
            onClick={handleTogglePlan}
            disabled={planLoading}
            className="mt-5 px-4 py-2 text-sm font-semibold text-[#0a0a0a] dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {planLoading
              ? "Switching…"
              : me?.plan === "premium"
                ? "Switch to free"
                : "Switch to premium"}
          </button>
        </Card>

        {/* Change password */}
        <Card title="Change password">
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <Field label="Current password">
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
                required
                className={inputClass}
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
                required
                minLength={6}
                placeholder="At least 6 characters"
                className={inputClass}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirm: e.target.value })
                }
                required
                minLength={6}
                className={inputClass}
              />
            </Field>
            <button
              type="submit"
              disabled={pwLoading}
              className="px-4 py-2 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              {pwLoading ? "Updating…" : "Update password"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="mb-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-[#0a0a0a] dark:text-white uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm text-[#0a0a0a] dark:text-white">{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
