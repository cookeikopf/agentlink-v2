import Link from "next/link"
import { ArrowRight, CheckCircle2, Shield, Sparkles } from "lucide-react"

const productPrinciples = [
  "Calm, restrained interface with institutional clarity",
  "Onchain-verifiable settlement and transparent service boundaries",
  "Security and operability treated as first-class product surfaces",
]

const standards = [
  {
    title: "Transparent by default",
    text: "API routes, contract addresses, and execution states are visible and testable in the shipped product.",
  },
  {
    title: "Built for controlled risk",
    text: "The architecture favors explicit states, deterministic flows, and audit-friendly integrations.",
  },
  {
    title: "Designed for long-term trust",
    text: "No inflated claims, no vanity metrics—only capabilities backed by the current implementation.",
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#ecefe8] text-[#0f1720]">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-8 md:pt-10">
        <header className="mb-10 flex items-center justify-between rounded-2xl border border-[#143329]/10 bg-white/70 px-5 py-4 backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#1b4d3b]/70">AgentLink</p>
            <p className="text-sm font-medium text-[#0f1720]">AI Commerce Infrastructure</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-[#0f2a22] px-4 py-2 text-sm font-medium text-[#d9f5e8] transition hover:bg-[#123428]"
          >
            Open App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="mb-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0f2a22]/15 bg-[#dff2e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f5a45]">
              <Shield className="h-3.5 w-3.5" />
              Pareto-inspired, trust-first digital product style
            </p>
            <h1 className="mb-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">
              Institutionelle Ruhe trifft auf verifizierbare Krypto-Ausführung.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#24333e]">
              AgentLink ist für Teams gebaut, die autonome Zahlungsprozesse professionell steuern wollen: klare
              Informationshierarchie, reduzierte Ästhetik und nachprüfbare Onchain-Abwicklung.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f2a22] px-5 py-3 font-semibold text-[#d9f5e8] transition hover:bg-[#123428]"
              >
                Zum Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/api/health"
                className="inline-flex items-center rounded-xl border border-[#0f2a22]/20 bg-white/70 px-5 py-3 font-semibold text-[#12202a] transition hover:bg-white"
              >
                Deployment Status prüfen
              </Link>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-3xl border border-[#0f2a22]/20 bg-[#08261c] p-7 text-[#d7eee3] shadow-[0_24px_70px_rgba(4,28,20,0.26)]">
            <div className="network-pulse absolute inset-0" />
            <div className="relative z-10">
              <p className="mb-4 text-xs uppercase tracking-[0.18em] text-[#8ec2ac]">Product Principles</p>
              <ul className="space-y-3 text-sm leading-6">
                {productPrinciples.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-[#7be0bb]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="mb-8 rounded-3xl border border-[#113328]/85 bg-[#0b2b21] p-5 md:p-8">
          <div className="diagram-shell rounded-2xl border border-[#9fc7b4]/25 bg-[#cfe0d5] p-5 md:p-8">
            <div className="mb-6 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#223830]">
              <span>AgentLink Payment Topology</span>
              <span>Live Structure • Base Sepolia</span>
            </div>
            <div className="grid gap-4 text-center text-sm md:grid-cols-3">
              <div className="diagram-node">Borrower Agent</div>
              <div className="diagram-node">Payment Router</div>
              <div className="diagram-node">Curator / Lender Agent</div>
            </div>
            <div className="my-4 h-px bg-[#42685a]/30" />
            <p className="text-center text-sm text-[#31463d]">
              Intent Match → Policy Validation → Onchain Settlement → Webhook Confirmation
            </p>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {standards.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-[#0f2a22]/12 bg-white/75 p-6 backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(4,32,24,0.1)]"
            >
              <Sparkles className="mb-4 h-4 w-4 text-[#246548]" />
              <h2 className="mb-2 text-lg font-semibold text-[#0d1d18]">{item.title}</h2>
              <p className="text-sm leading-6 text-[#2b3b35]">{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
