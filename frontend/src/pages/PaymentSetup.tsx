import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  payments as paymentsApi,
  type PayNowResponse,
  type GiroResponse,
  type MonthlyStatus,
} from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

const BANK_OPTIONS = ["DBS/POSB", "OCBC", "UOB", "Standard Chartered", "Citibank", "HSBC", "Maybank"]
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const nowDate = new Date()
const currentYear = nowDate.getFullYear()
const currentMonth = nowDate.getMonth() + 1

/** Which payment the user is making — subscription or donation */
type PayCategory = "SUBSCRIPTION" | "DONATION"
type PayMethod = "PAYNOW" | "GIRO"

export function PaymentSetup() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const { t } = useLanguage()

  // Monthly status tells us if subscription is already paid this month
  const [monthlyStatus, setMonthlyStatus] = useState<MonthlyStatus | null>(null)

  // If subscription is already paid, default tab to DONATION; otherwise SUBSCRIPTION
  const [category, setCategory] = useState<PayCategory>("SUBSCRIPTION")
  const [method, setMethod] = useState<PayMethod>("PAYNOW")

  const [periodMonth, setPeriodMonth] = useState(currentMonth)
  const [periodYear, setPeriodYear] = useState(currentYear)

  const [paynow, setPaynow] = useState<PayNowResponse | null>(null)
  const [giroResult, setGiroResult] = useState<GiroResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  // Donation amount
  const [donationAmount, setDonationAmount] = useState("")

  // GIRO form (legacy path — only shown if GIRO tab selected and no GIRO registered)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolder, setAccountHolder] = useState(user?.full_name ?? "")

  // Fetch monthly status on mount
  useEffect(() => {
    paymentsApi.monthlyStatus()
      .then((s) => {
        setMonthlyStatus(s)
        // Auto-switch to donation tab if already paid
        if (s.paid) setCategory("DONATION")
      })
      .catch(() => { /* non-fatal */ })
  }, [])

  // ─── PayNow generation ────────────────────────────────────────────────────
  const generatePayNow = async () => {
    setIsLoading(true)
    setError(null)
    setPaynow(null)
    try {
      const res = await paymentsApi.generatePayNow({
        period_month: periodMonth,
        period_year: periodYear,
        amount: category === "DONATION" ? parseFloat(donationAmount) : undefined,
        category,
      })
      setPaynow(res)
    } catch (err: any) {
      const payload = err?.detail?.detail ?? err?.detail
      const msg =
        typeof payload === "object" && payload?.code === "ALREADY_PAID"
          ? t.payment.alreadyPaidForPeriod
          : typeof payload === "object" && payload?.message
            ? payload.message
            : typeof payload === "string"
              ? payload
              : t.common.error
      setError(msg)
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
      setPaynow(null)
      setConfirmed(true)
      if (user) refreshUser({ ...user })
      // Refresh monthly status
      const updated = await paymentsApi.monthlyStatus()
      setMonthlyStatus(updated)
    } catch (err: any) {
      setError(err?.detail?.message ?? t.common.error)
    } finally {
      setIsConfirming(false)
    }
  }

  // ─── GIRO form (legacy, kept for setup page flow) ─────────────────────────
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
  const tierAmount = user?.membership_status === "PINTAR_PLUS" ? 20 : 5
  const amount = category === "DONATION"
    ? (parseFloat(donationAmount) || 0)
    : (paynow?.amount ?? tierAmount)

  // ─── Success screen ───────────────────────────────────────────────────────
  if (confirmed || giroResult) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 pb-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg">✅</div>
          <h1 className="font-playfair text-3xl text-green-deep mb-3">
            {giroResult ? t.payment.giroSuccess : (category === "DONATION" ? t.payment.donationTitle : t.payment.paymentSuccess)}
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
          <Button onClick={() => navigate("/dashboard")} className="h-12 px-10 rounded-xl font-semibold">Go to Dashboard →</Button>
        </div>
      </div>
    )
  }

  // ─── No tier selected ─────────────────────────────────────────────────────
  if (user?.membership_status === "NOT_REGISTERED") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="font-playfair text-2xl text-green-deep mb-3">{t.payment.noTierSelected}</h2>
          <p className="text-text-mid text-sm mb-6">{t.payment.selectTierFirst}</p>
          <Button onClick={() => navigate("/select-tier")} className="rounded-xl">{t.payment.selectTierCta}</Button>
        </div>
      </div>
    )
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-16 px-4">
      {/* Progress steps */}
      <div className="w-full max-w-[600px] mb-8 mt-4">
        <div className="flex items-center gap-2">
          {[t.payment.progressStep1, t.payment.progressStep2, t.payment.progressStep3, t.payment.progressStep4].map((step, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
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
        <div className="mb-6 text-center">
          <h1 className="font-playfair text-3xl text-green-deep mb-2">{t.payment.title}</h1>
          <p className="text-text-mid text-sm">{t.payment.subtitle}</p>
        </div>

        {/* Membership + monthly status summary */}
        <div className="bg-white rounded-2xl border border-green-pale px-6 py-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-text-light mb-1">{tierLabel} {t.payment.membership}</div>
            <div className="font-playfair text-2xl text-green-deep font-bold">
              ${tierAmount}<span className="text-sm font-normal text-text-light">/month</span>
            </div>
          </div>
          {/* Monthly payment status pill */}
          {monthlyStatus && (
            <div className={cn(
              "flex flex-col items-end gap-1",
            )}>
              <span className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full",
                monthlyStatus.paid
                  ? "bg-green-pale text-green-deep"
                  : "bg-amber-100 text-amber-800"
              )}>
                {t.payment.monthlyPaidTitle}: {monthlyStatus.paid ? t.payment.monthlyPaid : t.payment.monthlyUnpaid}
              </span>
              {!monthlyStatus.paid && (
                <span className="text-[11px] text-text-light">
                  {monthlyStatus.giro_active
                    ? t.payment.giroWillDeduct
                    : t.payment.monthlyDaysLeft(monthlyStatus.days_until_end_of_month)}
                </span>
              )}
            </div>
          )}
          <div className="text-3xl flex-shrink-0">🕌</div>
        </div>

        {/* Deactivation warning */}
        {user?.is_deactivated && (
          <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800 font-medium">
            ⚠️ {t.payment.deactivatedWarning}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-800">{error}</div>
        )}

        {/* Category tabs: Subscription vs Donation */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(["SUBSCRIPTION", "DONATION"] as PayCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => { setCategory(cat); setError(null); setPaynow(null) }}
              className={cn(
                "rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all",
                category === cat
                  ? "border-green-deep bg-green-deep text-white"
                  : "border-green-pale text-green-deep hover:border-green-soft"
              )}
            >
              {cat === "SUBSCRIPTION"
                ? `📋 ${t.payment.subscriptionTab}`
                : `🤲 ${t.payment.donationTab}`}
              {cat === "SUBSCRIPTION" && monthlyStatus?.paid && (
                <span className="ml-1.5 text-[10px] bg-green-soft/30 text-green-deep px-1.5 py-0.5 rounded-full">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Subscription: already paid notice */}
        {category === "SUBSCRIPTION" && monthlyStatus?.paid && (
          <div className="mb-5 rounded-xl bg-green-pale border border-green-soft/30 px-5 py-4 text-sm text-green-deep">
            ✅ {t.payment.alreadyPaidForPeriod}
          </div>
        )}

        {/* Donation description */}
        {category === "DONATION" && (
          <div className="mb-5 rounded-xl bg-gold/10 border border-gold/30 px-5 py-4 text-sm text-amber-900">
            🤲 {t.payment.donationDesc}
          </div>
        )}

        {/* Payment method toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(["PAYNOW", "GIRO"] as PayMethod[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMethod(m); setError(null); setPaynow(null) }}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all",
                method === m ? "border-green-deep bg-green-deep text-white" : "border-green-pale text-green-deep hover:border-green-soft"
              )}
            >
              {m === "PAYNOW" ? `📲 ${t.payment.paynow}` : `🏦 ${t.payment.giroShort}`}
            </button>
          ))}
        </div>

        {/* ── PayNow panel ── */}
        {method === "PAYNOW" && (
          <Card className="rounded-2xl border border-gold/20 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playfair text-green-deep">{t.payment.paynow}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5">
              <p className="text-sm text-text-mid text-center">{t.payment.paynowDesc}</p>

              {!paynow ? (
                <>
                  {/* Donation amount input */}
                  {category === "DONATION" && (
                    <div className="w-full flex flex-col gap-1.5">
                      <Label>{t.payment.donationAmount}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-sm font-medium">$</span>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="pl-7"
                          placeholder={t.payment.donationAmountPlaceholder}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Period selector (subscription only) */}
                  {category === "SUBSCRIPTION" && (
                    <div className="w-full grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label>{t.payment.selectMonth}</Label>
                        <select
                          className="flex h-12 w-full rounded-lg border border-green-deep/20 bg-cream-dark px-4 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-green-mid"
                          value={periodMonth}
                          onChange={(e) => { setPeriodMonth(Number(e.target.value)); setError(null); setPaynow(null) }}
                        >
                          {MONTHS.map((m) => (
                            <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString("default", { month: "long" })}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>{t.payment.selectYear}</Label>
                        <select
                          className="flex h-12 w-full rounded-lg border border-green-deep/20 bg-cream-dark px-4 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-green-mid"
                          value={periodYear}
                          onChange={(e) => { setPeriodYear(Number(e.target.value)); setError(null); setPaynow(null) }}
                        >
                          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="w-full rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">{error}</div>
                  )}

                  <Button
                    onClick={generatePayNow}
                    disabled={isLoading || (category === "DONATION" && !donationAmount)}
                    variant="secondary"
                    className="border border-green-deep/30 rounded-xl w-full"
                  >
                    {isLoading ? t.common.loading : t.payment.generateQR}
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-full rounded-lg bg-green-pale/50 border border-green-deep/20 px-3 py-2 text-sm text-green-deep text-center">
                    {category === "DONATION"
                      ? `${t.payment.donationTitle}: $${paynow.amount.toFixed(2)}`
                      : `${t.payment.payForPeriod}: ${new Date(periodYear, periodMonth - 1).toLocaleString("default", { month: "long" })} ${periodYear}`}
                  </div>
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
                  <Button onClick={handleConfirmPayNow} disabled={isConfirming} className="w-full h-12 rounded-xl font-semibold">
                    {isConfirming ? t.payment.confirming : (category === "DONATION" ? t.payment.donateBtn : t.payment.confirm)}
                  </Button>
                  <button onClick={() => setPaynow(null)} className="text-xs text-text-light underline underline-offset-2 hover:text-text-mid">
                    ← Change amount / period
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── GIRO panel ── */}
        {method === "GIRO" && !giroResult && (
          <Card className="rounded-2xl border border-green-pale shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-playfair text-green-deep">{t.payment.giro}</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.giro?.status === "ACTIVE" ? (
                /* GIRO already registered — show current mandate info */
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl bg-green-pale/60 border border-green-deep/20 px-5 py-4 text-sm">
                    <div className="font-semibold text-green-deep mb-2">✅ {t.payment.giroRegistered}</div>
                    <div className="grid grid-cols-2 gap-2 text-text-mid">
                      <span className="text-text-light">{t.payment.giroBank}</span>
                      <span className="font-medium">{user.giro.bank_name}</span>
                      <span className="text-text-light">{t.payment.giroAccount}</span>
                      <span className="font-mono">{user.giro.account_number_masked}</span>
                      <span className="text-text-light">{t.payment.giroMandate}</span>
                      <span className="font-mono">{user.giro.mandate_ref}</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                    {t.payment.giroSchedule}
                  </div>
                  <p className="text-sm text-text-mid text-center">
                    To update GIRO details, go to <strong>Profile → {t.payment.giroSection}</strong>.
                  </p>
                </div>
              ) : (
                /* GIRO not set up — show registration form */
                <>
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
                    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                      ⚠️ {t.payment.giroSchedule}. GIRO mandate processed within 3–5 working days.
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-semibold">
                      {isLoading ? t.payment.submitting : t.payment.submitGiro}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6">
          <button onClick={() => navigate("/dashboard")} className="text-sm text-text-light hover:text-text-mid underline underline-offset-2">
            I'll set up payment later
          </button>
        </div>
      </div>
    </div>
  )
}
