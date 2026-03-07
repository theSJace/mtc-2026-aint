import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SingpassButton } from "@/components/SingpassButton"
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
  const fromSingPass = searchParams.get("from") === "singpass"

  const [fullName, setFullName] = useState("")
  const [icNumber, setIcNumber] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [homeAddress, setHomeAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [dependants, setDependants] = useState<Dependant[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    // TODO: open SingPass/MyInfo flow and pre-fill fullName, icNumber, dateOfBirth, homeAddress, postalCode, contactNumber
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
        <h1 className="text-2xl md:text-3xl font-medium text-green-deep">
          Create your account
        </h1>
        <p className="text-sm text-text-mid">
          Enter your details. Auto-fill from SingPass if you signed in with it.
        </p>
      </div>

      <Card className="w-full max-w-[560px] mt-6 rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-green-deep">
            Sign up
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
                variant="link"
                onClick={handleRetrieveSingPass}
                className="text-left"
              >
                Auto-fill from Singpass
              </SingpassButton>

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
                    disabled={isSubmitting}
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
                variant="ghost"
                className="w-fit text-green-deep font-medium hover:bg-green-pale -ml-1"
                onClick={addDependant}
                disabled={isSubmitting}
              >
                Add dependant
              </Button>
            </section>

            <Button
              type="submit"
              className="w-full h-12 rounded-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up…" : "Sign up"}
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
