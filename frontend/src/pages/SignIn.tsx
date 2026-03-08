import { useState, useCallback, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { SingpassButton } from "@/components/SingpassButton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageToggle } from "@/components/LanguageToggle"
import { cn } from "@/lib/utils"
import { fetchMyInfoAfterSingpassAuth } from "@/lib/singpass"
import { auth as apiAuth } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

type SingpassStep = "idle" | "scan"

export function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [capsLock, setCapsLock] = useState(false)
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [singpassStep, setSingpassStep] = useState<SingpassStep>("idle")
  const [singpassScanning, setSingpassScanning] = useState(false)
  const [showSingpassConfirmDialog, setShowSingpassConfirmDialog] = useState(false)

  const singpassSessionId = useMemo(
    () => `singpass-demo-${Date.now()}`,
    [singpassStep]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState?.("CapsLock") ?? false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerErrorMessage(null)
    if (!email.trim() || !password) return
    setIsSubmitting(true)
    try {
      const res = await apiAuth.login({ email: email.trim(), password })
      login(res.access_token, res.user)
      navigate("/dashboard")
    } catch (err: unknown) {
      // API throws { status, detail } where detail = response body; FastAPI puts payload in body.detail
      const body = err && typeof err === "object" && "detail" in err ? (err as { detail?: unknown }).detail : undefined
      const payload = typeof body === "object" && body !== null && "detail" in body ? (body as { detail?: unknown }).detail : body
      const message =
        typeof payload === "object" && payload !== null && "message" in payload && typeof (payload as { message?: string }).message === "string"
          ? (payload as { message: string }).message
          : typeof payload === "string"
            ? payload
            : t.common.error
      setServerErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSingPass = () => setSingpassStep("scan")

  const handleSingpassConfirmOk = async () => {
    setShowSingpassConfirmDialog(false)
    setSingpassScanning(true)
    try {
      const prefill = await fetchMyInfoAfterSingpassAuth(singpassSessionId)
      navigate("/sign-up", {
        state: { fromSingpass: true, singpassPrefill: prefill },
        replace: true,
      })
    } finally {
      setSingpassScanning(false)
    }
  }

  const handleSingpassBack = () => setSingpassStep("idle")

  if (singpassStep === "scan") {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-12 px-4">
        <div className="w-full max-w-[440px] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleSingpassBack}
            className="flex items-center gap-2 text-sm text-text-mid hover:text-green-deep w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.signIn.back}
          </button>
          <LanguageToggle />
        </div>

        <Card className="w-full max-w-[440px] mt-6 rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-medium text-green-deep">
              {t.signIn.scanQr}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 items-center">
            <div className="bg-white p-4 rounded-xl border border-gold/20 inline-block">
              <QRCodeSVG value={singpassSessionId} size={220} level="M" includeMargin={false} />
            </div>
            <p className="text-sm text-text-mid text-center">{t.signIn.scanInstructions}</p>
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-lg font-medium border-2 border-green-deep"
              onClick={() => setShowSingpassConfirmDialog(true)}
              disabled={singpassScanning}
            >
              {singpassScanning ? t.signIn.retrieving : t.signIn.scanned}
            </Button>
          </CardContent>
        </Card>

        {showSingpassConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
            <Card className="w-full max-w-[440px] rounded-xl border border-gold/20 shadow-xl bg-cream">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-green-deep">{t.signIn.singpassData}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-text-mid">{t.signIn.singpassDesc}</p>
                <ul className="text-sm text-text-dark list-disc list-inside space-y-1">
                  {["Full Name","I/C Number","Date of Birth","Home Address","Postal Code","Contact Number","Email"].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="text-sm text-text-mid">{t.signIn.sharingOk}</p>
                <div className="flex gap-3 pt-2">
                  <Button type="button" className="flex-1 rounded-lg font-medium" onClick={handleSingpassConfirmOk} disabled={singpassScanning}>
                    {t.signIn.okay}
                  </Button>
                  <Button type="button" variant="secondary" className="flex-1 rounded-lg font-medium border-2 border-green-deep" onClick={() => setShowSingpassConfirmDialog(false)} disabled={singpassScanning}>
                    {t.signIn.notOkay}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-12 px-4">
      <div className="w-full max-w-[440px] flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 text-sm text-text-mid hover:text-green-deep w-fit">
          <ArrowLeft className="w-4 h-4" />
          {t.signIn.back}
        </Link>
        <LanguageToggle />
      </div>

      <Card className="w-full max-w-[440px] mt-6 rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-green-deep">{t.signIn.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">{t.signIn.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">{t.signIn.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyDown}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              {capsLock && <p className="text-xs text-[#E07B54]">{t.signIn.capsLock}</p>}
            </div>

            {serverErrorMessage && (
              <div className={cn("rounded-lg px-4 py-3 text-sm font-medium","bg-red-100 text-red-800 border border-red-200")} role="alert">
                {serverErrorMessage}
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-lg font-semibold" disabled={isSubmitting}>
              {isSubmitting ? t.signIn.submitting : t.signIn.submit}
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gold/30" />
            <span className="text-xs text-text-light">{t.signIn.or}</span>
            <div className="flex-1 h-px bg-gold/30" />
          </div>

          <SingpassButton onClick={handleSingPass} disabled={isSubmitting} />

          <p className="text-center text-sm text-text-mid pt-1">
            {t.signIn.newHere}{" "}
            <Link to="/sign-up" className="text-green-deep font-medium underline underline-offset-2 hover:text-green-mid">
              {t.signIn.signUpNow}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
