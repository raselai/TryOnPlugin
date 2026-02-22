"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    domain: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    apiKey: string;
    embedCode: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await api.createStore(formData);

      // Store the API key for future requests
      api.setApiKey(result.apiKey.key);

      setSuccess({
        apiKey: result.apiKey.key,
        embedCode: result.embedCode,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Created!
            </h1>
            <p className="mt-2 text-gray-600">
              Save your API key - it won&apos;t be shown again
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-yellow-50 p-4">
            <label className="mb-2 block text-sm font-medium text-yellow-800">
              Your API Key (save this!)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-yellow-100 p-2 text-sm">
                {success.apiKey}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(success.apiKey)}
                className="rounded bg-yellow-200 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-300"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Embed Code
            </label>
            <div className="relative">
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                {success.embedCode}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(success.embedCode)}
                className="absolute right-2 top-2 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
              >
                Copy
              </button>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="block w-full rounded-lg bg-brand-600 py-3 text-center font-medium text-white hover:bg-brand-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600" />
            <span className="text-xl font-bold">TryOn Plugin</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Create Your Account
          </h1>
          <p className="mb-6 text-gray-600">
            Get started with 100 free try-ons per month
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Store Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="My Awesome Store"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="domain"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Store Domain
              </label>
              <input
                id="domain"
                type="text"
                required
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="mystore.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                The domain where you&apos;ll use the widget
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Free Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/dashboard" className="text-brand-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
