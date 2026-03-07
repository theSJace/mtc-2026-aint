import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-medium text-green-deep">Dashboard</h1>
      <p className="text-text-mid text-sm">You are signed in.</p>
      <Link to="/sign-in">
        <Button variant="secondary">Sign out</Button>
      </Link>
    </div>
  )
}
