"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatNumber, formatDate, maskApiKey } from "@/lib/utils";
import { Copy, Plus, Trash2, Key, BarChart3, Settings, LogOut } from "lucide-react";

interface Store {
  id: string;
  name: string;
  email: string;
  domain: string;
  planId: string;
  planName: string;
  monthlyQuota: number;
  usedQuota: number;
  quotaResetAt: string;
  status: string;
}

interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

interface Usage {
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  };
  daily: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [embedCode, setEmbedCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "keys" | "embed">("overview");

  useEffect(() => {
    const apiKey = api.getApiKey();
    if (!apiKey) {
      router.push("/signup");
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [storeData, keysData, usageData, embedData] = await Promise.all([
        api.getStore(),
        api.getApiKeys(),
        api.getUsage(),
        api.getEmbedCode(),
      ]);

      setStore(storeData);
      setApiKeys(keysData.apiKeys);
      setUsage(usageData);
      setEmbedCode(embedData.embedCode);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Invalid API key")) {
        api.clearApiKey();
        router.push("/signup");
      }
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    try {
      const result = await api.createApiKey(newKeyName || undefined);
      setShowNewKey(result.key);
      setNewKeyName("");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      await api.revokeApiKey(keyId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    api.clearApiKey();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Link href="/signup" className="text-brand-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  const quotaPercentage = store
    ? Math.min((store.usedQuota / store.monthlyQuota) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600" />
            <span className="text-xl font-bold">TryOn Plugin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {store?.name}
          </h1>
          <p className="text-gray-600">{store?.domain}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-medium ${
              activeTab === "overview"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("keys")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-medium ${
              activeTab === "keys"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Key className="h-4 w-4" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab("embed")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 font-medium ${
              activeTab === "embed"
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Copy className="h-4 w-4" />
            Embed Code
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quota Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Monthly Usage</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600">
                  {formatNumber(store?.usedQuota || 0)} /{" "}
                  {formatNumber(store?.monthlyQuota || 0)}
                </span>
                <span className="font-medium">{quotaPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    quotaPercentage > 90
                      ? "bg-red-500"
                      : quotaPercentage > 70
                      ? "bg-yellow-500"
                      : "bg-brand-500"
                  }`}
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Resets {formatDate(store?.quotaResetAt || new Date())}
              </p>
            </div>

            {/* Plan Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">Current Plan</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-brand-600">
                  {store?.planName}
                </span>
              </div>
              {store?.planId === "free" && (
                <Link
                  href="/settings"
                  className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>

            {/* Stats Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-gray-900">This Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(usage?.summary.successfulRequests || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(usage?.summary.failedRequests || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === "keys" && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">API Keys</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (optional)"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  onClick={createApiKey}
                  className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Key
                </button>
              </div>
            </div>

            {showNewKey && (
              <div className="mb-6 rounded-lg bg-yellow-50 p-4">
                <p className="mb-2 text-sm font-medium text-yellow-800">
                  New API Key Created (copy now - won&apos;t be shown again!)
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-yellow-100 p-2 text-sm">
                    {showNewKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(showNewKey);
                      setShowNewKey(null);
                    }}
                    className="rounded bg-yellow-200 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-300"
                  >
                    Copy & Close
                  </button>
                </div>
              </div>
            )}

            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Key</th>
                  <th className="pb-3">Last Used</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id} className="border-b">
                    <td className="py-3 font-medium">{key.name}</td>
                    <td className="py-3">
                      <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                        {key.keyPrefix}...
                      </code>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      {key.isActive && apiKeys.filter((k) => k.isActive).length > 1 && (
                        <button
                          onClick={() => revokeApiKey(key.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Embed Code Tab */}
        {activeTab === "embed" && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-900">
              Installation Instructions
            </h3>

            <div className="mb-6">
              <p className="mb-2 text-sm text-gray-600">
                1. Add this script to your website&apos;s &lt;head&gt; or before
                &lt;/body&gt;:
              </p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  {embedCode}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(embedCode)}
                  className="absolute right-2 top-2 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-600">
                2. Add the <code>data-tryon-image</code> attribute to any button:
              </p>
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
{`<button data-tryon-image="https://yoursite.com/product.jpg">
  Try this on
</button>`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
