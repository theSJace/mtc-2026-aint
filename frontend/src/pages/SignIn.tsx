import { useState, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
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

type SignInError = "account" | "password"

export function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState<SignInError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState?.("CapsLock") ?? false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) return
    setIsSubmitting(true)
    try {
      // TODO: replace with real API
      const res = await simulateSignIn(email.trim(), password)
      if (res === "ok") {
        navigate("/dashboard")
        return
      }
      setError(res === "no_account" ? "account" : "password")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSingPass = () => {
    // TODO: trigger SingPass/MyInfo flow. After API returns:
    // - if user exists in DB -> navigate("/dashboard")
    // - if IC not registered -> navigate("/sign-up?from=singpass")
    navigate("/sign-up?from=singpass")
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center pt-[80px] pb-12 px-4">
      <div className="w-full max-w-[440px] flex flex-col gap-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-text-mid hover:text-green-deep w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <h1 className="text-2xl md:text-3xl font-medium text-green-deep">
          Sign in to your account
        </h1>
        <p className="text-sm text-text-mid">
          Use email/password or SingPass
        </p>
      </div>

      <Card className="w-full max-w-[440px] mt-6 rounded-xl border border-gold/20 shadow-lg shadow-green-deep/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium text-green-deep">
            Sign in
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password (case-sensitive)</Label>
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
              {capsLock && (
                <p className="text-xs text-[#E07B54]">
                  Caps Lock is on.
                </p>
              )}
            </div>

            {error && (
              <div
                className={cn(
                  "rounded-lg px-4 py-3 text-sm font-medium",
                  "bg-red-100 text-red-800 border border-red-200"
                )}
                role="alert"
              >
                {error === "account"
                  ? "This account does not exist"
                  : "Password is wrong, please try again"}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gold/30" />
            <span className="text-xs text-text-light">or</span>
            <div className="flex-1 h-px bg-gold/30" />
          </div>

          <SingpassButton
            onClick={handleSingPass}
            disabled={isSubmitting}
          />

          <p className="text-center text-sm text-text-mid pt-1">
            <Link
              to="/sign-up"
              className="text-green-deep font-medium underline underline-offset-2 hover:text-green-mid"
            >
              New here? Sign up now.
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Mock: replace with real API. Returns "ok" | "no_account" | "wrong_password"
async function simulateSignIn(
  email: string,
  password: string
): Promise<"ok" | "no_account" | "wrong_password"> {
  await new Promise((r) => setTimeout(r, 600))
  const exists = email.endsWith("@example.com")
  if (!exists) return "no_account"
  if (password !== "password") return "wrong_password"
  return "ok"
}
