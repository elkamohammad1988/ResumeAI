import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate("/dashboard");
    else setError(result.error);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center bg-zinc-50/50 dark:bg-zinc-900/40 px-6 pt-16 pb-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to continue building.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 dark:text-white rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#00d96f] focus:ring-2 focus:ring-[#00d96f]/20 transition"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 dark:text-white rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#00d96f] focus:ring-2 focus:ring-[#00d96f]/20 transition"
              />
            </div>

            {error && (
              <p className="px-3 py-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-md">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-center text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#0a0a0a] dark:text-white hover:text-[#00a350] dark:hover:text-[#00d96f]"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
