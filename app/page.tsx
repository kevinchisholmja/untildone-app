import Link from "next/link";
import {
  Bell,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bell className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              untildone
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:py-32">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
            Persistent reminders that never quit
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Reminders that don&apos;t stop until it&apos;s done
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            untildone sends you recurring email reminders for tasks that matter.
            They never expire. They only stop when you mark them complete.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border px-6 text-base font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            100 reminder emails/month free. No credit card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Built for persistence
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            This is not a calendar. This is a persistent reminder engine.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                Never expires
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reminders keep going until you say it&apos;s done. Days, weeks,
                months -- it doesn&apos;t matter.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                Smart delivery
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Choose aggressive, balanced, or gentle delivery modes.
                Frequency adjusts automatically over time.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                Your inbox only
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reminders go to your verified email only. No spam relay. No
                abuse. Just your tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                1
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                Create a reminder
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Set a title, due date, and choose how often you want to be
                reminded.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                2
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                Get emailed
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Receive persistent email reminders at your chosen interval until
                you take action.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                3
              </div>
              <h3 className="mt-4 font-semibold text-foreground">
                Mark it done
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete the task from your email or dashboard. Reminders stop
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-secondary/50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Simple pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Unlimited reminders on every plan. We only meter emails sent.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                emails: "100",
                price: "$0",
                features: [
                  "100 reminder emails/month",
                  "All delivery modes",
                  "Email support",
                ],
              },
              {
                name: "Starter",
                emails: "1,000",
                price: "$9",
                features: [
                  "1,000 reminder emails/month",
                  "All delivery modes",
                  "Priority support",
                ],
                highlighted: true,
              },
              {
                name: "Pro",
                emails: "10,000",
                price: "$29",
                features: [
                  "10,000 reminder emails/month",
                  "All delivery modes",
                  "Priority support",
                ],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-6 ${
                  tier.highlighted
                    ? "border-primary bg-card shadow-md"
                    : "border-border bg-card"
                }`}
              >
                <h3 className="font-semibold text-foreground">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier.emails} emails/month
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">untildone</span>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Built for persistence
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
