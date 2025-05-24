"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LandingPage from "@/components/landing-page"
import UserDashboard from "@/components/user-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Redirect logged-in users to dashboard, non-logged-in to landing
    if (status === "authenticated" && session) {
      // User is logged in, show dashboard
      return
    } else if (status === "unauthenticated") {
      // User is not logged in, show landing page
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="container py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[100px] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return session ? <UserDashboard /> : <LandingPage />
}
