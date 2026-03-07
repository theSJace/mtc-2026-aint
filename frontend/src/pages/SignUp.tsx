import { useState, useEffect } from "react"
import { useSearchParams, useLocation, Link, useNavigate } from "react-router-dom"
import type { SingpassPrefill } from "@/lib/singpass"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SingpassButton } from "@/components/SingpassButton"
import { SingpassScanAndConfirm } from "@/components/SingpassScanAndConfirm"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { auth as apiAuth } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"

const RELATIONSHIP_OPTIONS = ["Spouse", "Parents", "In-laws", "Children", "Sibling"] as const
type Relationship = (typeof RELATIONSHIP_OPTIONS)[number]

interface Dependant {
  id: string
  fullName: string
  dateOfBirth: string
  relationship: Relationship | ""
  sameAddress: boolean
  address: string
  nric: string
}

function newDependant(): Dependant {
  return { id: crypto.randomUUID(), fullName: "", dateOfBirth: "", relationship: "", sameAddress: true, address: "", nric: "" }
}

export function SignUp() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const locationState = location.state as { fromSingpass?: boolean; singpassPrefill?: SingpassPrefill } | null
  const fromSingPass = searchParams.get("from") === "singpass" || locationState?.fromSingpass === true
  const initialPrefill = locationState?.singpassPrefill
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()

  const [fullName, setFullName] = useState("")
  const [icNumber, setIcNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [homeAddress, setHomeAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [dependants, setDependants] = useState<Dependant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [singpassFlowOpen, setSingpassFlowOpen] = useState(false)
  const [prefilledBySingpass, setPrefilledBySingpass] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialPrefill) {
      setFullName(initialPrefill.fullName ?? "")
      setIcNumber(initialPrefill.icNumber ?? "")
      setDateOfBirth(initialPrefill.dateOfBirth ?? "")
      setHomeAddress(initialPrefill.homeAddress ?? "")
      setPostalCode(initialPrefill.postalCode ?? "")
      setContactNumber(initialPrefill.contactNumber ?? "")
      setEmail(initialPrefill.email ?? "")
      setPrefilledBySingpass(true)
    }
  }, [initialPrefill])

  const addDependant = () => setDependants((prev) => [...prev, newDependant()])
  const updateDependant = (id: string, updates: Partial<Dependant>) =>
    setDependants((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)))
  const removeDependant = (id: string) =>
    setDependants((prev) => prev.filter((d) => d.id !== id))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!password || password.length < 8) errs.password = "Password must be at least 8 characters."
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match."
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    const errs = validate()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return
    setIsSubmitting(true)
    try {
      const res = await apiAuth.register({
        nric: icNumber,
        full_name: fullName,
        email,
        password,
        phone: contactNumber,
        address: homeAddress,
        postal_code: postalCode,
        date_of_birth: dateOfBirth,
        dependents: dependants.map((d) => ({
          full_name: d.fullName,
          date_of_birth: d.dateOfBirth,
          relationship: d.relationship,
          same_address: d.sameAddress,
          address: d.sameAddress ? homeAddress : d.address,
          nric: d.nric || undefined,
        })),
      })
      login(res.access_token, res.user)
      navigate("/select-tier")
    } catch (err: any) {
      const code = err?.detail?.code
      if (code === "NRIC_IS_DEPENDENT") {
        setServerError(`This NRIC is already registered as a dependant under another account (${err?.detail?.primary_email ?? ""}). Please contact mosque staff.`)
      } else if (code === "NRIC_EXISTS") {
        setServerError("An account with this NRIC already exists. Please sign in instead.")
      } else if (code === "EMAIL_EXISTS") {
        setServerError("This email is already registered. Please sign in.")
      } else {
        setServerError(err?.detail?.message ?? t.common.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSingpassConfirm = (prefill: SingpassPrefill) => {
    setFullName(prefill.fullName ?? "")
    setIcNumber(prefill.icNumber ?? "")
    setDateOfBirth(prefill.dateOfBirth ?? "")
    setHomeAddress(prefill.homeAddress ?? "")
    setPostalCode(prefill.postalCode ?? "")
    setContactNumber(prefill.contactNumber ?? "")
    setEmail(prefill.email ?? "")
    setPrefilledBySingpass(true)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-12 px-4">
      <div className="w-full max-w-[560px] flex flex-col gap-2">
        <Link to="/sign-in" className="flex items-center gap-2 text-sm text-text-mid hover:text-green-deep w-fit">
          <ArrowLeft className="w-4 h-4" />
          {t.signUp.back}
        </Link>
      </div>

      <Card className="w-full max-w-[560px] mt-6 rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-green-deep">{t.signUp.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          {fromSingPass && (
            <div className="rounded-lg bg-green-pale/60 border border-green-mid/30 px-5 py-4">
              <p className="text-sm text-green-deep font-medium">{t.signUp.prefilled}</p>
            </div>
          )}

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4">
              <p className="text-sm text-red-800 font-medium">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Personal Information */}
            <section className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-light">{t.signUp.personalInfo}</h2>
              <SingpassButton onClick={() => setSingpassFlowOpen(true)}>{t.signUp.autofill}</SingpassButton>
              <SingpassScanAndConfirm
                open={singpassFlowOpen}
                onClose={() => setSingpassFlowOpen(false)}
                onConfirm={handleSingpassConfirm}
                title={t.signUp.autofill}
                asModal
              />

              {[
                { id: "fullName", label: t.signUp.fullName, value: fullName, set: setFullName, type: "text" as const },
                { id: "icNumber", label: t.signUp.icNumber, value: icNumber, set: setIcNumber, type: "text" as const },
                { id: "dob", label: t.signUp.dob, value: dateOfBirth, set: setDateOfBirth, type: "date" as const },
                { id: "address", label: t.signUp.address, value: homeAddress, set: setHomeAddress, type: "text" as const },
                { id: "postalCode", label: t.signUp.postalCode, value: postalCode, set: setPostalCode, type: "text" as const },
                { id: "contact", label: t.signUp.contact, value: contactNumber, set: setContactNumber, type: "tel" as const },
                { id: "email", label: t.signUp.email, value: email, set: setEmail, type: "email" as const },
              ].map(({ id, label, value, set, type }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    disabled={isSubmitting || (prefilledBySingpass && id !== "email")}
                  />
                </div>
              ))}

              {/* Password fields — always manual */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">{t.signUp.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {formErrors.password && <p className="text-xs text-red-600">{formErrors.password}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">{t.signUp.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {formErrors.confirmPassword && <p className="text-xs text-red-600">{formErrors.confirmPassword}</p>}
              </div>
            </section>

            {/* Dependants */}
            <section className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-light">{t.signUp.dependants}</h2>
              {dependants.length === 0 ? (
                <p className="text-sm text-text-mid">{t.signUp.noDependants}</p>
              ) : (
                dependants.map((dep, idx) => (
                  <div key={dep.id} className="flex flex-col gap-3 p-4 rounded-lg border border-gold/20 bg-cream-dark/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-deep">
                        {t.signUp.dependants} {idx + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeDependant(dep.id)}
                      >
                        {t.signUp.remove}
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label>{t.signUp.depFullName}</Label>
                        <Input value={dep.fullName} onChange={(e) => updateDependant(dep.id, { fullName: e.target.value })} required disabled={isSubmitting} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>{t.signUp.depDob}</Label>
                        <Input type="date" value={dep.dateOfBirth} onChange={(e) => updateDependant(dep.id, { dateOfBirth: e.target.value })} required disabled={isSubmitting} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>{t.signUp.depRelationship}</Label>
                        <select
                          className={cn("flex h-12 w-full rounded-lg border border-green-deep/20 bg-cream-dark px-4 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-green-mid focus:border-transparent","disabled:opacity-50")}
                          value={dep.relationship}
                          onChange={(e) => updateDependant(dep.id, { relationship: e.target.value as Relationship })}
                          required
                          disabled={isSubmitting}
                        >
                          <option value="">{t.signUp.selectRelationship}</option>
                          {RELATIONSHIP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>{t.signUp.depNric}</Label>
                        <Input value={dep.nric} onChange={(e) => updateDependant(dep.id, { nric: e.target.value })} disabled={isSubmitting} placeholder="e.g. S9876543A" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`same-${dep.id}`}
                          checked={dep.sameAddress}
                          onChange={(e) => updateDependant(dep.id, { sameAddress: e.target.checked })}
                          className="h-4 w-4 rounded border-green-deep/30 text-green-deep focus:ring-green-mid"
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={`same-${dep.id}`} className="font-normal cursor-pointer">{t.signUp.sameAddress}</Label>
                      </div>
                      {!dep.sameAddress && (
                        <div className="flex flex-col gap-1.5">
                          <Label>{t.signUp.depAddress}</Label>
                          <Input value={dep.address} onChange={(e) => updateDependant(dep.id, { address: e.target.value })} required={!dep.sameAddress} disabled={isSubmitting} />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto gap-2 rounded-lg font-medium border-2 border-green-deep bg-green-pale text-green-deep hover:bg-green-soft hover:border-green-mid"
                onClick={addDependant}
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4 shrink-0" />
                {t.signUp.addDependant}
              </Button>
            </section>

            <Button type="submit" className="w-full h-12 rounded-lg font-semibold" disabled={isSubmitting}>
              {isSubmitting ? t.signUp.submitting : t.signUp.submit}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-text-mid">
        {t.signUp.alreadyHave}{" "}
        <Link to="/sign-in" className="text-green-deep font-medium underline underline-offset-2 hover:text-green-mid">
          {t.signUp.signIn}
        </Link>
      </p>
    </div>
  )
}
