import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import CreateAuctionForm from "@/components/create-auction-form"

export default async function CreateAuctionPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Auction</h1>
          <p className="text-muted-foreground">
            List your item for auction and let buyers bid on it. Fill out all the details to create an attractive
            listing.
          </p>
        </div>

        <CreateAuctionForm />
      </div>
    </div>
  )
}
