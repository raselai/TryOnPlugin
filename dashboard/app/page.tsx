"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    quota: 100,
    features: [
      "100 try-ons per month",
      "5 requests per minute",
      "Basic support",
      "Single domain",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    quota: 1000,
    features: [
      "1,000 try-ons per month",
      "20 requests per minute",
      "Priority support",
      "Multiple domains",
      "$0.05 per extra try-on",
    ],
    cta: "Start Trial",
    highlighted: true,
  },
  {
    id: "growth",
    name: "Growth",
    price: 99,
    quota: 10000,
    features: [
      "10,000 try-ons per month",
      "60 requests per minute",
      "Priority support",
      "Unlimited domains",
      "$0.03 per extra try-on",
      "Custom branding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-600" />
            <span className="text-xl font-bold">TryOn Plugin</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
            Virtual Try-On for
            <br />
            <span className="text-brand-600">Any eCommerce Store</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Let customers see how products look on them before buying.
            Increase conversions and reduce returns with AI-powered try-on.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-6 py-3 text-lg font-medium text-white hover:bg-brand-700"
            >
              Start Free Trial
            </Link>
            <a
              href="#pricing"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Add to Your Store in 2 Minutes
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600">
                1
              </div>
              <h3 className="mb-2 font-semibold">Sign Up</h3>
              <p className="text-gray-600">
                Create your account with email and store domain
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600">
                2
              </div>
              <h3 className="mb-2 font-semibold">Copy Embed Code</h3>
              <p className="text-gray-600">
                Paste one line of code into your store
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600">
                3
              </div>
              <h3 className="mb-2 font-semibold">Add Buttons</h3>
              <p className="text-gray-600">
                Add try-on buttons to your product pages
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="mb-12 text-center text-gray-600">
            Start free, upgrade when you grow
          </p>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "border-2 border-brand-600 bg-white shadow-lg"
                    : "border border-gray-200 bg-white"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-4 inline-block rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-600">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full rounded-lg py-3 text-center font-medium ${
                    plan.highlighted
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} TryOn Plugin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
