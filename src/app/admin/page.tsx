
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F5EF] px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#334B3D] text-2xl text-white shadow-lg">
            A.
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8A9B82]">
            Personal Portfolio
          </p>

          <h1 className="mt-3 font-serif text-4xl text-[#334B3D]">
            Welcome back.
          </h1>

          <p className="mt-3 text-sm text-[#77766F]">
            Sign in to manage your portfolio.
          </p>
        </div>

        <div className="rounded-3xl border border-[#E7E3D9] bg-white p-8 shadow-[0_20px_60px_rgba(51,75,61,0.08)]">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-[#334B3D]">
              Admin Login
            </h2>
            <p className="mt-1 text-sm text-[#88877F]">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[#454A42]"
              >
                Username
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-[#E5E3DA] bg-[#FCFBF8] px-4 py-3 text-sm text-[#334B3D] outline-none transition focus:border-[#82977C] focus:ring-2 focus:ring-[#A5B69A]/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#454A42]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#E5E3DA] bg-[#FCFBF8] px-4 py-3 pr-20 text-sm text-[#334B3D] outline-none transition focus:border-[#82977C] focus:ring-2 focus:ring-[#A5B69A]/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#82977C] hover:text-[#334B3D]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#334B3D] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#263B2F] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard →"}
            </button>
          </form>

          <div className="mt-7 border-t border-[#EEECE5] pt-5 text-center">
            <p className="text-xs text-[#96948B]">
              Private administrator access · Astha&apos;s Portfolio
            </p>
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-[#A09E95]">
          © 2026 · All rights reserved
        </p>
      </div>
    </main>
  );
}
