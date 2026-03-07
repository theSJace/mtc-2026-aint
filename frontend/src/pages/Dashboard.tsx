import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, Pencil, Trash2, LogOut, User, CreditCard, Users, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { dependents as depsApi, payments as paymentsApi, type Dependent, type Payment } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageToggle } from "@/components/LanguageToggle"

type Tab = "overview" | "dependants" | "payments" | "profile"

const RELATIONSHIP_OPTIONS = ["Spouse", "Parents", "In-laws", "Children", "Sibling"] as const
type Relationship = (typeof RELATIONSHIP_OPTIONS)[number]

interface DependantForm {
  fullName: string
  dateOfBirth: string
  relationship: Relationship | ""
  sameAddress: boolean
  address: string
  nric: string
}

function emptyForm(): DependantForm {
  return { fullName: "", dateOfBirth: "", relationship: "", sameAddress: true, address: "", nric: "" }
}

export function Dashboard() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const { t } = useLanguage()

  const [tab, setTab] = useState<Tab>("overview")
  const [dependants, setDependants] = useState<Dependent[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoadingDeps, setIsLoadingDeps] = useState(false)
  const [isLoadingPay, setIsLoadingPay] = useState(false)

  // Dependant add/edit form
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DependantForm>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Confirm remove
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/sign-in")
  }, [user])

  // Load dependants when tab opens
  useEffect(() => {
    if (tab === "dependants" && dependants.length === 0) loadDependants()
  }, [tab])

  useEffect(() => {
    if (tab === "payments" && payments.length === 0) loadPayments()
  }, [tab])

  const loadDependants = async () => {
    setIsLoadingDeps(true)
    try {
      const data = await depsApi.list()
      setDependants(data)
    } catch { /* silent */ } finally { setIsLoadingDeps(false) }
  }

  const loadPayments = async () => {
    setIsLoadingPay(true)
    try {
      const data = await paymentsApi.list()
      setPayments(data)
    } catch { /* silent */ } finally { setIsLoadingPay(false) }
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (dep: Dependent) => {
    setEditingId(dep.id)
    setForm({
      fullName: dep.full_name,
      dateOfBirth: dep.date_of_birth,
      relationship: dep.relationship as Relationship,
      sameAddress: dep.same_address,
      address: dep.address,
      nric: dep.nric,
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.dateOfBirth || !form.relationship) return
    setFormSubmitting(true)
    setFormError(null)
    try {
      const payload = {
        full_name: form.fullName,
        date_of_birth: form.dateOfBirth,
        relationship: form.relationship,
        same_address: form.sameAddress,
        address: form.sameAddress ? (user?.address ?? "") : form.address,
        nric: form.nric || undefined,
      }
      if (editingId) {
        const updated = await depsApi.update(editingId, payload)
        setDependants((prev) => prev.map((d) => d.id === editingId ? updated : d))
      } else {
        const created = await depsApi.add(payload)
        setDependants((prev) => [...prev, created])
      }
      setShowForm(false)
    } catch (err: any) {
      const code = err?.detail?.code
      if (code === "NRIC_IS_PRIMARY") setFormError("This NRIC already has a primary account.")
      else setFormError(err?.detail?.message ?? t.common.error)
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      await depsApi.remove(id)
      setDependants((prev) => prev.filter((d) => d.id !== id))
    } catch { /* silent */ } finally { setConfirmRemoveId(null) }
  }

  const handleSignOut = () => {
    logout()
    navigate("/")
  }

  if (!user) return null

  const statusColors: Record<string, string> = {
    NOT_REGISTERED: "bg-amber-100 text-amber-800",
    PINTAR: "bg-green-pale text-green-deep",
    PINTAR_PLUS: "bg-gold/20 text-amber-900",
  }
  const statusLabel = t.dashboard.statuses[user.membership_status as keyof typeof t.dashboard.statuses]
  const isActive = user.membership_status !== "NOT_REGISTERED"
  const monthlyFee = user.membership_status === "PINTAR_PLUS" ? "$20" : user.membership_status === "PINTAR" ? "$5" : "—"

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "overview", icon: <LayoutDashboard size={16} />, label: t.dashboard.tabs.overview },
    { id: "dependants", icon: <Users size={16} />, label: t.dashboard.tabs.dependants },
    { id: "payments", icon: <CreditCard size={16} />, label: t.dashboard.tabs.payments },
    { id: "profile", icon: <User size={16} />, label: t.dashboard.tabs.profile },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-xl border-b border-gold/20 px-5 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-deep flex items-center justify-center text-white text-sm">🕌</div>
          <strong className="font-playfair text-sm text-green-deep">Skim Pintar</strong>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button onClick={handleSignOut} className="flex items-center gap-1.5 text-xs text-text-mid hover:text-green-deep transition-colors">
            <LogOut size={14} />
            <span className="hidden sm:inline">{t.dashboard.signOut}</span>
          </button>
        </div>
      </header>

      <div className="pt-[60px] flex min-h-screen">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 border-r border-gold/10 bg-white pt-8 pb-6 px-4 fixed top-[60px] bottom-0 left-0">
          <div className="flex flex-col gap-1">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => setTab(tb.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  tab === tb.id ? "bg-green-deep text-white" : "text-text-mid hover:bg-green-pale hover:text-green-deep"
                )}
              >
                {tb.icon}
                {tb.label}
              </button>
            ))}
          </div>
          <div className="mt-auto">
            <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-light hover:text-red-600 w-full rounded-lg hover:bg-red-50 transition-colors">
              <LogOut size={15} />
              {t.dashboard.signOut}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-56 px-4 md:px-8 py-6 pb-24 max-w-4xl">
          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm text-text-light">{t.dashboard.welcome}</p>
                <h1 className="font-playfair text-2xl text-green-deep">{user.full_name}</h1>
                <p className="text-xs text-text-light mt-0.5">{t.dashboard.memberSince} {new Date(user.created_at).toLocaleDateString("en-SG", { year: "numeric", month: "long" })}</p>
              </div>

              {/* Membership card */}
              <div className={cn("rounded-2xl p-6 relative overflow-hidden", isActive ? "bg-gradient-to-br from-green-deep to-green-mid" : "bg-white border-2 border-dashed border-green-pale")}>
                {isActive && (
                  <>
                    <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-8 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />
                  </>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className={cn("text-xs font-semibold mb-1", isActive ? "text-white/60" : "text-text-light")}>
                        {t.dashboard.membershipCard}
                      </div>
                      <div className={cn("font-playfair text-xl font-bold", isActive ? "text-white" : "text-text-dark")}>
                        {statusLabel}
                      </div>
                    </div>
                    <span className={cn("text-xs font-bold px-3 py-1 rounded-full", isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700")}>
                      {isActive ? t.dashboard.coverageActive : t.dashboard.noCoverage}
                    </span>
                  </div>
                  {isActive ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-white/60 text-[10px] uppercase tracking-wider mb-1">{t.dashboard.memberId}</div>
                        <div className="text-white font-mono text-sm font-semibold">{user.membership_id ?? "—"}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-[10px] uppercase tracking-wider mb-1">{t.dashboard.monthlyFee}</div>
                        <div className="text-white font-semibold text-sm">{monthlyFee}/month</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-3">
                      <Button onClick={() => navigate("/select-tier")} className="rounded-lg text-sm h-9 px-5">
                        {t.dashboard.selectTier}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Family Members", value: dependants.length.toString(), icon: "👨‍👩‍👧" },
                  { label: "Payment Method", value: payments.some(p => p.status === "COMPLETED") ? "Active" : "Pending", icon: "💳" },
                  { label: "Coverage", value: isActive ? "Full" : "None", icon: "🛡️" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-green-pale p-4 text-center">
                    <div className="text-2xl mb-1.5">{s.icon}</div>
                    <div className="font-semibold text-green-deep text-sm">{s.value}</div>
                    <div className="text-[10px] text-text-light mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="bg-white rounded-2xl border border-green-pale p-5">
                <h3 className="text-sm font-semibold text-green-deep mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Add Family Member", icon: "👤", action: () => { setTab("dependants"); setTimeout(openAdd, 100) } },
                    { label: isActive ? "Make Payment" : "Activate Now", icon: "💰", action: () => navigate(isActive ? "/payment-setup" : "/select-tier") },
                    { label: "View History", icon: "📋", action: () => setTab("payments") },
                    { label: "Edit Profile", icon: "✏️", action: () => setTab("profile") },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={a.action}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-cream hover:bg-green-pale transition-colors text-center"
                    >
                      <span className="text-2xl">{a.icon}</span>
                      <span className="text-[11px] text-text-mid font-medium leading-tight">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DEPENDANTS ── */}
          {tab === "dependants" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl text-green-deep">{t.dashboard.dependants}</h2>
                  <p className="text-xs text-text-light mt-0.5">Family members under your Skim Pintar coverage</p>
                </div>
                <Button onClick={openAdd} className="gap-2 rounded-xl text-sm h-9">
                  <Plus size={14} />
                  {t.dashboard.addDependant.replace("+ ", "")}
                </Button>
              </div>

              {isLoadingDeps ? (
                <div className="text-center py-12 text-text-light text-sm animate-pulse">{t.common.loading}</div>
              ) : dependants.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-green-pale p-12 text-center">
                  <div className="text-5xl mb-4">👨‍👩‍👧</div>
                  <p className="text-text-mid text-sm mb-5">{t.dashboard.noDependants}</p>
                  <Button onClick={openAdd} variant="secondary" className="border border-green-deep/20 rounded-xl gap-2">
                    <Plus size={14} />
                    {t.dashboard.addDependant}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {dependants.map((dep) => (
                    <div key={dep.id} className="bg-white rounded-2xl border border-green-pale px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex gap-4 items-start min-w-0">
                        <div className="w-10 h-10 rounded-full bg-green-pale flex items-center justify-center text-lg flex-shrink-0">
                          {dep.relationship === "Children" ? "👧" : dep.relationship === "Spouse" ? "💑" : "👤"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-green-deep text-sm truncate">{dep.full_name}</div>
                          <div className="text-xs text-text-light mt-0.5">
                            {dep.relationship} · Born {new Date(dep.date_of_birth).toLocaleDateString("en-SG")}
                          </div>
                          {dep.nric && <div className="text-xs text-text-light font-mono mt-0.5">{dep.nric}</div>}
                          <div className="text-xs text-text-light mt-0.5">
                            {dep.same_address ? "Same address" : dep.address}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(dep)} className="w-8 h-8 rounded-lg bg-green-pale text-green-deep flex items-center justify-center hover:bg-green-soft hover:text-white transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setConfirmRemoveId(dep.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {tab === "payments" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl text-green-deep">{t.dashboard.paymentHistory}</h2>
                  <p className="text-xs text-text-light mt-0.5">All your Skim Pintar transactions</p>
                </div>
                {isActive && (
                  <Button onClick={() => navigate("/payment-setup")} className="rounded-xl text-sm h-9 gap-1.5">
                    <CreditCard size={14} />
                    {t.dashboard.makePayment}
                  </Button>
                )}
              </div>

              {!isActive && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 px-5 py-4 flex gap-3 items-center">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <div className="text-sm font-medium text-amber-900">No active membership</div>
                    <div className="text-xs text-amber-700 mt-0.5">
                      <Link to="/select-tier" className="underline">{t.dashboard.selectTier}</Link> to start making payments.
                    </div>
                  </div>
                </div>
              )}

              {isLoadingPay ? (
                <div className="text-center py-12 text-text-light text-sm animate-pulse">{t.common.loading}</div>
              ) : payments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-green-pale p-12 text-center">
                  <div className="text-5xl mb-4">💳</div>
                  <p className="text-text-mid text-sm">{t.dashboard.noPayments}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-green-pale overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-cream border-b border-green-pale">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.dashboard.paymentDate}</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.dashboard.paymentType}</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.dashboard.paymentAmount}</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.dashboard.paymentStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-pale/50">
                      {payments.map((p) => {
                        const statusMap: Record<string, { color: string; label: string }> = {
                          COMPLETED: { color: "bg-green-pale text-green-deep", label: t.dashboard.statuses2.COMPLETED },
                          PENDING: { color: "bg-amber-100 text-amber-700", label: t.dashboard.statuses2.PENDING },
                          FAILED: { color: "bg-red-100 text-red-700", label: t.dashboard.statuses2.FAILED },
                        }
                        const s = statusMap[p.status] ?? statusMap.PENDING
                        return (
                          <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                            <td className="px-5 py-3.5 text-text-mid">{new Date(p.created_at).toLocaleDateString("en-SG")}</td>
                            <td className="px-5 py-3.5 font-mono text-xs text-text-dark">{p.payment_type}</td>
                            <td className="px-5 py-3.5 font-semibold text-green-deep">${p.amount.toFixed(2)}</td>
                            <td className="px-5 py-3.5">
                              <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", s.color)}>{s.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-playfair text-2xl text-green-deep">{t.dashboard.profile}</h2>
                <p className="text-xs text-text-light mt-0.5">Your personal details and account info</p>
              </div>
              <div className="bg-white rounded-2xl border border-green-pale p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4 pb-4 border-b border-green-pale/50">
                  <div className="w-16 h-16 rounded-full bg-green-deep flex items-center justify-center text-white text-2xl font-playfair">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-green-deep text-lg">{user.full_name}</div>
                    <div className="text-xs text-text-light mt-0.5">{user.email}</div>
                    <span className={cn("mt-1.5 inline-block text-xs font-bold px-2.5 py-0.5 rounded-full", statusColors[user.membership_status])}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: t.dashboard.nric, value: user.nric },
                    { label: t.dashboard.phone, value: user.phone },
                    { label: t.dashboard.email, value: user.email },
                    { label: t.dashboard.memberId, value: user.membership_id ?? "—" },
                    { label: t.dashboard.address, value: user.address + (user.postal_code ? ` S(${user.postal_code})` : "") },
                    { label: "Date of Birth", value: user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString("en-SG") : "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[11px] text-text-light uppercase tracking-wide mb-1">{label}</div>
                      <div className="text-sm text-text-dark font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-green-pale p-5">
                <h3 className="text-sm font-semibold text-green-deep mb-4">Language Preference</h3>
                <LanguageToggle />
              </div>

              <Button
                onClick={handleSignOut}
                variant="secondary"
                className="w-full sm:w-auto h-11 rounded-xl text-red-600 border-red-200 hover:bg-red-50 gap-2"
              >
                <LogOut size={15} />
                {t.dashboard.signOut}
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gold/20 flex">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              tab === tb.id ? "text-green-deep" : "text-text-light"
            )}
          >
            <span className={cn("transition-colors", tab === tb.id ? "text-green-deep" : "text-text-light")}>{tb.icon}</span>
            {tb.label}
          </button>
        ))}
      </nav>

      {/* Add/Edit Dependant Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-[480px] rounded-2xl border border-gold/20 shadow-2xl bg-cream max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-2 sticky top-0 bg-cream z-10 border-b border-green-pale/50">
              <CardTitle className="text-lg font-playfair text-green-deep">
                {editingId ? t.dashboard.edit + " Family Member" : t.dashboard.addDependant}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {formError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">{formError}</div>
              )}
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>{t.signUp.depFullName}</Label>
                  <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required disabled={formSubmitting} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t.signUp.depDob}</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} required disabled={formSubmitting} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t.signUp.depRelationship}</Label>
                  <select
                    className="flex h-12 w-full rounded-lg border border-green-deep/20 bg-cream-dark px-4 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-green-mid"
                    value={form.relationship}
                    onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value as Relationship }))}
                    required
                    disabled={formSubmitting}
                  >
                    <option value="">{t.signUp.selectRelationship}</option>
                    {RELATIONSHIP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t.signUp.depNric}</Label>
                  <Input value={form.nric} onChange={(e) => setForm((f) => ({ ...f, nric: e.target.value }))} placeholder="e.g. S9876543A" disabled={formSubmitting} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dep-same"
                    checked={form.sameAddress}
                    onChange={(e) => setForm((f) => ({ ...f, sameAddress: e.target.checked }))}
                    className="h-4 w-4 rounded"
                    disabled={formSubmitting}
                  />
                  <Label htmlFor="dep-same" className="font-normal cursor-pointer">{t.signUp.sameAddress}</Label>
                </div>
                {!form.sameAddress && (
                  <div className="flex flex-col gap-1.5">
                    <Label>{t.signUp.depAddress}</Label>
                    <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} required={!form.sameAddress} disabled={formSubmitting} />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={formSubmitting} className="flex-1 rounded-xl h-11">
                    {formSubmitting ? t.common.loading : t.common.save}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1 rounded-xl h-11 border border-green-deep/20">
                    {t.common.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm remove modal */}
      {confirmRemoveId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-[360px] rounded-2xl border border-gold/20 shadow-2xl bg-cream">
            <CardContent className="pt-6 pb-5 flex flex-col items-center gap-4 text-center">
              <div className="text-4xl">🗑️</div>
              <p className="text-sm text-text-mid">{t.dashboard.confirmRemove}</p>
              <div className="flex gap-3 w-full">
                <Button onClick={() => handleRemove(confirmRemoveId)} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700">
                  {t.common.yes}
                </Button>
                <Button variant="secondary" onClick={() => setConfirmRemoveId(null)} className="flex-1 rounded-xl border border-green-deep/20">
                  {t.common.cancel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
