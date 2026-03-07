import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { payments as paymentsApi, type PayNowResponse, type GiroResponse } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

const BANK_OPTIONS = ["DBS/POSB", "OCBC", "UOB", "Standard Chartered", "Citibank", "HSBC", "Maybank"]
type PayMethod = "PAYNOW" | "GIRO"

export function PaymentSetup() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { t } = useLanguage()

  const [method, setMethod] = useState<PayMethod>("PAYNOW")
  const [paynow, setPaynow] = useState<PayNowResponse | null>(null)
  const [giroResult, setGiroResult] = useState<GiroResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  // GIRO form state
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolder, setAccountHolder] = useState(user?.full_name ?? "")

  useEffect(() => {
    // Auto-generate PayNow QR on mount
    if (user?.membership_status !== "NOT_REGISTERED") {
      generatePayNow()
    }
  }, [])

  const generatePayNow = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await paymentsApi.generatePayNow()
      setPaynow(res)
    } catch (err: any) {
      setError(err?.detail?.message ?? t.common.error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPayNow = async () => {
    if (!paynow) return
    setIsConfirming(true)
    setError(null)
    try {
      await paymentsApi.confirm(paynow.payment_id)
      setConfirmed(true)
      if (user) refreshUser({ ...user })
    } catch (err: any) {
      setError(err?.detail?.message ?? t.common.error)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleGiroSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bankName || !accountNumber || !accountHolder) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await paymentsApi.setupGiro({ bank_name: bankName, account_number: accountNumber, account_holder_name: accountHolder })
      setGiroResult(res)
    } catch (err: any) {
      setError(err?.detail?.message ?? t.common.error)
    } finally {
      setIsLoading(false)
    }
  }

  const tierLabel = user?.membership_status === "PINTAR_PLUS" ? "Pintar Plus" : "Pintar"
  const amount = paynow?.amount ?? (user?.membership_status === "PINTAR_PLUS" ? 20 : 5)

  if (confirmed || giroResult) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">
            ✅
          </div>
          <h1 className="font-playfair text-3xl text-green-deep mb-3">
            {giroResult ? t.payment.giroSuccess : t.payment.paymentSuccess}
          </h1>
          <p className="text-text-mid text-sm mb-4 leading-relaxed">
            {giroResult ? giroResult.message : t.payment.giroMessage}
          </p>
          {(paynow || giroResult) && (
            <div className="bg-white rounded-xl border border-green-pale px-6 py-4 mb-8 text-sm">
              <div className="flex justify-between text-text-mid mb-2">
                <span>{t.payment.membershipId}</span>
                <span className="font-semibold text-green-deep">{paynow?.reference ?? giroResult?.reference}</span>
              </div>
              {giroResult && (
                <div className="flex justify-between text-text-mid">
                  <span>Mandate Ref</span>
                  <span className="font-semibold text-green-deep">{giroResult.mandate_ref}</span>
                </div>
              )}
            </div>
          )}
          <Button onClick={() => navigate("/dashboard")} className="h-12 px-10 rounded-xl font-semibold">
            Go to Dashboard →
          </Button>
        </div>
      </div>
    )
  }

  // No tier selected yet
  if (user?.membership_status === "NOT_REGISTERED") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-playfair text-2xl text-green-deep mb-3">No Tier Selected</h2>
          <p className="text-text-mid text-sm mb-6">Please select a membership tier before setting up payment.</p>
          <Button onClick={() => navigate("/select-tier")} className="rounded-xl">Select a Tier →</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-16 px-4">
      {/* Progress */}
      <div className="w-full max-w-[600px] mb-8 mt-4">
        <div className="flex items-center gap-2">
          {["Account Created", "Tier Selected", "Payment Setup", "Active"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${i < 2 ? "bg-green-soft text-white" : i === 2 ? "bg-green-deep text-white" : "bg-green-pale text-text-light"}`}>
                {i < 2 ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === 2 ? "text-green-deep font-medium" : "text-text-light"}`}>{step}</span>
              {i < 3 && <div className="flex-1 h-px bg-green-pale mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[600px]">
        <div className="mb-8 text-center">
          <h1 className="font-playfair text-3xl text-green-deep mb-2">{t.payment.title}</h1>
          <p className="text-text-mid text-sm">{t.payment.subtitle}</p>
        </div>

        {/* Membership summary */}
        <div className="bg-white rounded-2xl border border-green-pale px-6 py-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-light mb-1">{tierLabel} Membership</div>
            <div className="font-playfair text-2xl text-green-deep font-bold">${amount}<span className="text-sm font-normal text-text-light">/month</span></div>
          </div>
          <div className="text-3xl">🕌</div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-800">{error}</div>
        )}

        {/* Method toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["PAYNOW", "GIRO"] as PayMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMethod(m); setError(null) }}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                method === m ? "border-green-deep bg-green-deep text-white" : "border-green-pale text-green-deep hover:border-green-soft"
              )}
            >
              {m === "PAYNOW" ? `📲 ${t.payment.paynow}` : `🏦 GIRO`}
            </button>
          ))}
        </div>

        {/* PayNow */}
        {method === "PAYNOW" && (
          <Card className="rounded-2xl border border-gold/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playfair text-green-deep">{t.payment.paynow}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5">
              <p className="text-sm text-text-mid text-center">{t.payment.paynowDesc}</p>

              {isLoading ? (
                <div className="w-[220px] h-[220px] bg-green-pale/50 rounded-xl flex items-center justify-center">
                  <span className="text-text-light text-sm animate-pulse">{t.common.loading}</span>
                </div>
              ) : paynow ? (
                <>
                  <div className="bg-white p-4 rounded-2xl border border-gold/20 shadow-sm">
                    <QRCodeSVG value={paynow.qr_data} size={200} level="M" includeMargin={false} />
                  </div>
                  <div className="w-full bg-cream rounded-xl px-5 py-3 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-text-light">{t.payment.amount}</span>
                      <span className="font-semibold text-green-deep">${paynow.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">{t.payment.reference}</span>
                      <span className="font-semibold text-green-deep">{paynow.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">UEN</span>
                      <span className="font-semibold text-green-deep">{paynow.uen}</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-light text-center">{t.payment.scanInstructions}</p>
                  <Button
                    onClick={handleConfirmPayNow}
                    disabled={isConfirming}
                    className="w-full h-12 rounded-xl font-semibold"
                  >
                    {isConfirming ? t.payment.confirming : t.payment.confirm}
                  </Button>
                </>
              ) : (
                <Button onClick={generatePayNow} variant="secondary" className="border border-green-deep/30 rounded-xl">
                  Generate QR Code
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* GIRO */}
        {method === "GIRO" && !giroResult && (
          <Card className="rounded-2xl border border-green-pale shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playfair text-green-deep">{t.payment.giro}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-mid mb-5">{t.payment.giroDesc}</p>
              <form onSubmit={handleGiroSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{t.payment.bankName}</Label>
                  <select
                    className="flex h-12 w-full rounded-lg border border-green-deep/20 bg-cream-dark px-4 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-green-mid"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  >
                    <option value="">{t.payment.selectBank}</option>
                    {BANK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t.payment.accountNumber}</Label>
                  <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required placeholder="e.g. 123-456-789-0" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t.payment.accountHolder}</Label>
                  <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required />
                </div>
                <div className="bg-amber-50 rounded-lg px-4 py-3 text-xs text-amber-800 border border-amber-200">
                  ⚠️ GIRO mandate will be processed within 3–5 working days. Monthly deductions begin on the 1st of next month.
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-semibold">
                  {isLoading ? t.payment.submitting : t.payment.submitGiro}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-text-light hover:text-text-mid underline underline-offset-2"
          >
            I'll set up payment later
          </button>
        </div>
      </div>
    </div>
  )
}
