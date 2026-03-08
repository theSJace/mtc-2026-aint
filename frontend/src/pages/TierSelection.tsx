import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { membership as membershipApi } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

type Tier = "PINTAR" | "PINTAR_PLUS"

const TIERS: {
  id: Tier
  amount: number
  features: { key: keyof Features; value?: string }[]
}[] = [
  {
    id: "PINTAR",
    amount: 5,
    features: [
      { key: "coverage" },
      { key: "dependants", value: "5" },
      { key: "priority", value: "false" },
      { key: "welfare", value: "false" },
    ],
  },
  {
    id: "PINTAR_PLUS",
    amount: 20,
    features: [
      { key: "coverage" },
      { key: "dependants", value: "unlimited" },
      { key: "priority", value: "true" },
      { key: "welfare", value: "true" },
    ],
  },
]

interface Features {
  coverage: string
  dependants: string
  priority: string
  welfare: string
}

export function TierSelection() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { t } = useLanguage()
  const [selected, setSelected] = useState<Tier | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selected) return
    setIsLoading(true)
    setError(null)
    try {
      await membershipApi.selectTier(selected)
      if (user) refreshUser({ ...user, membership_status: selected })
      navigate("/payment-setup")
    } catch (err: any) {
      setError(err?.detail?.message ?? t.common.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-16 px-4">
      {/* Progress indicator */}
      <div className="w-full max-w-[680px] mb-8 mt-4">
        <div className="flex items-center gap-2">
          {["Account Created", "Select Tier", "Payment Setup", "Active"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${
                i === 0 ? "bg-green-soft text-white" :
                i === 1 ? "bg-green-deep text-white" :
                "bg-green-pale text-text-light"
              }`}>
                {i === 0 ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === 1 ? "text-green-deep font-medium" : "text-text-light"}`}>
                {step}
              </span>
              {i < 3 && <div className="flex-1 h-px bg-green-pale mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[680px]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-pale text-green-mid px-3.5 py-1.5 rounded-full text-xs font-semibold mb-4 border border-green-soft/30">
            🕌 Masjid Ar-Raudhah
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl text-green-deep mb-3">{t.tier.title}</h1>
          <p className="text-text-mid text-sm max-w-md mx-auto">{t.tier.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800">{error}</div>
        )}

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {TIERS.map((tier) => {
            const isSelected = selected === tier.id
            const isPlus = tier.id === "PINTAR_PLUS"
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelected(tier.id)}
                className={`relative text-left rounded-2xl border-2 p-6 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-mid focus:ring-offset-2 ${
                  isSelected
                    ? "border-green-deep bg-white shadow-lg shadow-green-deep/10"
                    : "border-green-pale bg-white hover:border-green-soft"
                }`}
              >
                {isPlus && (
                  <div className="absolute -top-3 left-5 bg-gold text-green-deep px-3 py-0.5 rounded-full text-[11px] font-bold">
                    ✦ Most Popular
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-green-deep" />
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-xl ${isPlus ? "bg-gold/10" : "bg-green-pale"}`}>
                  {isPlus ? "⭐" : "🌙"}
                </div>

                <div className="font-playfair text-xl text-green-deep mb-1">
                  {isPlus ? t.tier.pintarPlus : t.tier.pintar}
                </div>
                <p className="text-xs text-text-mid mb-5 leading-relaxed">
                  {isPlus ? t.tier.pintarPlusDesc : t.tier.pintarDesc}
                </p>

                <div className="mb-5">
                  <span className="font-playfair text-3xl font-bold text-green-deep">${tier.amount}</span>
                  <span className="text-text-light text-sm">{t.tier.perMonth}</span>
                </div>

                <ul className="flex flex-col gap-2.5">
                  <FeatureRow label={t.tier.coverage} included />
                  <FeatureRow label={`${t.tier.dependants}: ${isPlus ? t.tier.unlimited : "5"}`} included />
                  <FeatureRow label={t.tier.priority} included={isPlus} />
                  <FeatureRow label={t.tier.welfare} included={isPlus} />
                </ul>

                <div className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${
                  isSelected
                    ? "bg-green-deep text-white"
                    : "bg-green-pale text-green-deep"
                }`}>
                  {isSelected ? t.tier.selected : t.tier.select}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selected || isLoading}
            className="h-12 px-10 rounded-xl font-semibold text-base"
          >
            {isLoading ? t.common.loading : t.tier.continue}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard")}
            className="h-12 px-8 rounded-xl border border-green-deep/20"
          >
            Skip for now →
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2 text-xs text-text-mid">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${included ? "bg-green-pale text-green-mid" : "bg-cream-dark text-text-light"}`}>
        {included ? "✓" : "×"}
      </span>
      {label}
    </li>
  )
}
