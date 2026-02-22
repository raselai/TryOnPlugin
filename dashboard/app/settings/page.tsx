"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";

interface Store {
  id: string;
  name: string;
  email: string;
  domain: string;
  allowedDomains: string[];
  planId: string;
  planName: string;
  monthlyQuota: number;
  status: string;
}

interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  monthlyQuota: number;
  requestsPerMin: number;
  overagePrice: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    allowedDomains: "",
  });

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
      const [storeData, plansData] = await Promise.all([
        api.getStore(),
        api.getPlans(),
      ]);

      setStore(storeData);
      setPlans(plansData.plans);
      setFormData({
        name: storeData.name,
        domain: storeData.domain,
        allowedDomains: storeData.allowedDomains.join("\n"),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const allowedDomains = formData.allowedDomains
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);

      await api.updateStore({
        name: formData.name,
        domain: formData.domain,
        allowedDomains,
      });

      setSuccess("Settings saved successfully");
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      const result = await api.createCheckout(
        planId,
        `${window.location.origin}/settings?success=true`,
        `${window.location.origin}/settings?cancelled=true`
      );

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleManageBilling = async () => {
    try {
      const result = await api.getBillingPortal(window.location.href);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Store Settings */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Store Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Primary Domain
              </label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Allowed Domains (one per line)
              </label>
              <textarea
                value={formData.allowedDomains}
                onChange={(e) =>
                  setFormData({ ...formData, allowedDomains: e.target.value })
                }
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm"
                placeholder={`mystore.com\n*.mystore.com\nstaging.mystore.com`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Use *.domain.com for wildcard subdomains
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Subscription</h2>

          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="font-medium text-gray-900">
                Current Plan: {store?.planName}
              </p>
              <p className="text-sm text-gray-600">
                {formatNumber(store?.monthlyQuota || 0)} try-ons per month
              </p>
            </div>
            {store?.planId !== "free" && (
              <button
                onClick={handleManageBilling}
                className="flex items-center gap-1 text-brand-600 hover:underline"
              >
                Manage Billing
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>

          <h3 className="mb-4 font-medium text-gray-900">Available Plans</h3>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-4 ${
                  store?.planId === plan.id
                    ? "border-brand-600 bg-brand-50"
                    : "border-gray-200"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {store?.planId === plan.id && (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="mb-4">
                  <span className="text-2xl font-bold">
                    {formatCurrency(plan.priceMonthly)}
                  </span>
                  <span className="text-gray-600">/month</span>
                </p>
                <ul className="mb-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {formatNumber(plan.monthlyQuota)} try-ons/month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {plan.requestsPerMin} requests/minute
                  </li>
                  {plan.overagePrice > 0 && (
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {formatCurrency(plan.overagePrice)} per extra
                    </li>
                  )}
                </ul>
                {store?.planId !== plan.id && plan.id !== "free" && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-red-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-red-600">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Contact support to delete your account and all associated data.
          </p>
          <a
            href="mailto:support@tryonplugin.com"
            className="text-sm text-red-600 hover:underline"
          >
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}
