import { Routes, Route, Navigate } from "react-router-dom"
import { SignIn } from "@/pages/SignIn"
import { SignUp } from "@/pages/SignUp"
import { Dashboard } from "@/pages/Dashboard"
import { Home } from "@/pages/Home"
import { TierSelection } from "@/pages/TierSelection"
import { PaymentSetup } from "@/pages/PaymentSetup"
import { useAuth } from "@/contexts/AuthContext"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/select-tier" element={<RequireAuth><TierSelection /></RequireAuth>} />
      <Route path="/payment-setup" element={<RequireAuth><PaymentSetup /></RequireAuth>} />
    </Routes>
  )
}

export default App
