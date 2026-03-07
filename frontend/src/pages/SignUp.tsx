import { useState, useEffect } from "react"
import { useSearchParams, useLocation, Link } from "react-router-dom"
import type { SingpassPrefill } from "@/lib/singpass"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SingpassButton } from "@/components/SingpassButton"
import { SingpassScanAndConfirm } from "@/components/SingpassScanAndConfirm"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Parents",
  "In-laws",
  "Children",
  "Sibling",
] as const

type Relationship = (typeof RELATIONSHIP_OPTIONS)[number]

interface Dependant {
  id: string
  fullName: string
  dateOfBirth: string
  relationship: Relationship | ""
  sameAddress: boolean
  address: string
}

function newDependant(): Dependant {
  return {
    id: crypto.randomUUID(),
    fullName: "",
    dateOfBirth: "",
    relationship: "",
    sameAddress: true,
    address: "",
  }
}

export function SignUp() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const locationState = location.state as { fromSingpass?: boolean; singpassPrefill?: SingpassPrefill } | null
  const fromSingPass = searchParams.get("from") === "singpass" || locationState?.fromSingpass === true
  const initialPrefill = locationState?.singpassPrefill

  const [fullName, setFullName] = useState("")
  const [icNumber, setIcNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [homeAddress, setHomeAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [dependants, setDependants] = useState<Dependant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [singpassFlowOpen, setSingpassFlowOpen] = useState(false)
  /** When true, personal info fields were pre-filled from SingPass and are disabled */
  const [prefilledBySingpass, setPrefilledBySingpass] = useState(false)

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

  const addDependant = () => {
    setDependants((prev) => [...prev, newDependant()])
  }

  const updateDependant = (id: string, updates: Partial<Dependant>) => {
    setDependants((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    )
  }

  const removeDependant = (id: string) => {
    setDependants((prev) => prev.filter((d) => d.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // TODO: submit to API
      await new Promise((r) => setTimeout(r, 800))
      // navigate("/dashboard") or show success
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetrieveSingPass = () => {
    setSingpassFlowOpen(true)
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
        <Link
          to="/sign-in"
          className="flex items-center gap-2 text-sm text-text-mid hover:text-green-deep w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>

      <Card className="w-full max-w-[560px] mt-6 rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-green-deep">
            Create an Account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          {fromSingPass && (
            <div className="rounded-lg bg-green-pale/60 border border-green-mid/30 px-5 py-4">
              <p className="text-sm text-green-deep font-medium">
                ID not registered. We have pre-filled your SingPass details —
                please complete the rest.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <section className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-light">
                Personal information
              </h2>
              <SingpassButton
                onClick={handleRetrieveSingPass}
              >
                Auto-fill from Singpass
              </SingpassButton>

              <SingpassScanAndConfirm
                open={singpassFlowOpen}
                onClose={() => setSingpassFlowOpen(false)}
                onConfirm={handleSingpassConfirm}
                title="Auto-fill from Singpass"
                asModal
              />

              {[
                { id: "fullName", label: "Full Name *", value: fullName, set: setFullName, type: "text" as const },
                { id: "icNumber", label: "I/C Number *", value: icNumber, set: setIcNumber, type: "text" as const },
                { id: "dob", label: "Date of Birth *", value: dateOfBirth, set: setDateOfBirth, type: "date" as const },
                { id: "address", label: "Home Address *", value: homeAddress, set: setHomeAddress, type: "text" as const },
                { id: "postalCode", label: "Postal Code *", value: postalCode, set: setPostalCode, type: "text" as const },
                { id: "contact", label: "Contact Number *", value: contactNumber, set: setContactNumber, type: "tel" as const },
                { id: "email", label: "Email *", value: email, set: setEmail, type: "email" as const },
              ].map(({ id, label, value, set, type }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    disabled={isSubmitting || prefilledBySingpass}
                  />
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-light">
                Dependants
              </h2>
              {dependants.length === 0 ? (
                <p className="text-sm text-text-mid">
                  No dependants yet. Add one if needed.
                </p>
              ) : (
                dependants.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex flex-col gap-3 p-4 rounded-lg border border-gold/20 bg-cream-dark/50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-deep">
                        Dependant
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeDependant(dep.id)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label>Full Name *</Label>
                        <Input
                          value={dep.fullName}
                          onChange={(e) =>
                            updateDependant(dep.id, { fullName: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Date of Birth *</Label>
                        <Input
                          type="date"
                          value={dep.dateOfBirth}
                          onChange={(e) =>
                            updateDependant(dep.id, { dateOfBirth: e.target.value })
                          }
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Relationship (e.g. spouse, child) *</Label>
                        <select
                          className={cn(
                            "flex h-12 w-full rounded-lg border border-green-deep/20 bg-cream-dark px-4 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-green-mid focus:border-transparent",
                            "disabled:opacity-50"
                          )}
                          value={dep.relationship}
                          onChange={(e) =>
                            updateDependant(dep.id, {
                              relationship: e.target.value as Relationship,
                            })
                          }
                          required
                          disabled={isSubmitting}
                        >
                          <option value="">Select...</option>
                          {RELATIONSHIP_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`same-${dep.id}`}
                          checked={dep.sameAddress}
                          onChange={(e) =>
                            updateDependant(dep.id, {
                              sameAddress: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-green-deep/30 text-green-deep focus:ring-green-mid"
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={`same-${dep.id}`} className="font-normal cursor-pointer">
                          Living at same address?
                        </Label>
                      </div>
                      {!dep.sameAddress && (
                        <div className="flex flex-col gap-1.5">
                          <Label>Address (if different) *</Label>
                          <Input
                            value={dep.address}
                            onChange={(e) =>
                              updateDependant(dep.id, { address: e.target.value })
                            }
                            required={!dep.sameAddress}
                            disabled={isSubmitting}
                          />
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
                Add dependant
              </Button>
            </section>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account…" : "Create an Account"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-text-mid">
        Already have an account?{" "}
        <Link
          to="/sign-in"
          className="text-green-deep font-medium underline underline-offset-2 hover:text-green-mid"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
