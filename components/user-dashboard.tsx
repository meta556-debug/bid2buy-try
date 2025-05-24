"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProducts } from "@/app/actions/product-actions"
import { getWalletBalance } from "@/app/actions/wallet-actions"
import { getUserBids } from "@/app/actions/product-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ProductGrid from "@/components/product-grid"
import EnhancedFilterSidebar from "@/components/enhance-filter-sidebar"
import { Wallet, TrendingUp, Eye, Filter, SlidersHorizontal, X, Plus, Star, Trophy, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function UserDashboard() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const category = searchParams.get("category") || "all"
  const search = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "newest"
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const timeFilter = searchParams.get("timeFilter") || "all"
  const condition = searchParams.get("condition") || "all"
  const location = searchParams.get("location") || ""

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [userBids, setUserBids] = useState<any[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [dashboardStats, setDashboardStats] = useState({
    activeBids: 0,
    watchingItems: 0,
    totalSpent: 0,
    wonAuctions: 0,
  })

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "ending-soon", label: "Ending Soon" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "most-bids", label: "Most Bids" },
    { value: "recommended", label: "Recommended for You" },
  ]

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [fetchedProducts, balance, bids] = await Promise.all([
        getProducts(
          category !== "all" ? category : undefined,
          search,
          sort,
          minPrice ? Number.parseFloat(minPrice) : undefined,
          maxPrice ? Number.parseFloat(maxPrice) : undefined,
          timeFilter !== "all" ? timeFilter : undefined,
        ),
        getWalletBalance(),
        getUserBids(),
      ])

      setProducts(fetchedProducts)
      setWalletBalance(balance || 0)
      setUserBids(bids)

      // Get recommended products based on user's bidding history
      const userCategories = bids.map((bid) => bid.product.category)
      const recommended = fetchedProducts
        .filter(
          (product) => userCategories.includes(product.category) && !bids.some((bid) => bid.productId === product.id),
        )
        .slice(0, 4)
      setRecommendedProducts(recommended)

      // Calculate dashboard stats
      const activeBids = bids.filter(
        (bid) => bid.product.status === "ACTIVE" && new Date(bid.product.endTime) > new Date(),
      ).length

      const wonAuctions = bids.filter(
        (bid) => bid.product.status === "ENDED" && bid.product.winnerId === session?.user?.id,
      ).length

      const totalSpent = bids.reduce((sum, bid) => sum + bid.amount, 0)

      setDashboardStats({
        activeBids,
        watchingItems: bids.length,
        totalSpent,
        wonAuctions,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [category, search, sort, minPrice, maxPrice, timeFilter, condition, location])

  const updateFilters = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value)
      } else {
        urlParams.delete(key)
      }
    })

    router.push(`/?${urlParams.toString()}`)
  }

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value })
  }

  const clearFilters = () => {
    router.push("/")
  }

  const hasActiveFilters =
    category !== "all" ||
    !!search ||
    sort !== "newest" ||
    !!minPrice ||
    !!maxPrice ||
    timeFilter !== "all" ||
    condition !== "all" ||
    !!location

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[120px] w-full rounded-lg" />
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

  return (
    <div className="container py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {session?.user?.name || "User"}! 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your auctions today.</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(walletBalance)}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/wallet" className="text-primary hover:underline">
                Add funds →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.activeBids}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/profile" className="text-primary hover:underline">
                View all bids →
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Auctions</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dashboardStats.wonAuctions}</div>
            <p className="text-xs text-muted-foreground">Successful purchases</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(dashboardStats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Across all bids</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          asChild
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Link href="/sell">
            <Plus className="h-4 w-4 mr-2" />
            Sell Item
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/wallet">
            <Wallet className="h-4 w-4 mr-2" />
            Add Funds
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/profile">
            <Eye className="h-4 w-4 mr-2" />
            My Bids
          </Link>
        </Button>
      </div>

      {/* Recommended for You */}
      {recommendedProducts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  {product.mediaType === "video" && product.videoUrl ? (
                    <video
                      src={product.videoUrl}
                      className="object-cover w-full h-full"
                      muted
                      loop
                      poster={product.images?.[0]}
                    />
                  ) : (
                    <img
                      src={product.images?.[0] || "/placeholder.svg?height=200&width=300"}
                      alt={product.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.title}</h3>
                  <p className="text-lg font-bold text-green-600 mt-1">{formatCurrency(product.currentPrice)}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {product._count?.bids || 0} bids
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Browse All Auctions</h2>
          {search && (
            <p className="text-muted-foreground">
              Search results for: <span className="font-medium text-foreground">{search}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isMobile ? (
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {
                        Object.entries({
                          category,
                          search,
                          minPrice,
                          maxPrice,
                          timeFilter,
                          condition,
                          location,
                        }).filter(
                          ([key, value]) =>
                            (key === "category" && value !== "all") ||
                            (key === "timeFilter" && value !== "all") ||
                            (key === "condition" && value !== "all") ||
                            (key !== "category" && key !== "timeFilter" && key !== "condition" && value),
                        ).length
                      }
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <EnhancedFilterSidebar
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  timeFilter={timeFilter}
                  condition={condition}
                  location={location}
                  onFilterChange={updateFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {
                    Object.entries({ category, search, minPrice, maxPrice, timeFilter, condition, location }).filter(
                      ([key, value]) =>
                        (key === "category" && value !== "all") ||
                        (key === "timeFilter" && value !== "all") ||
                        (key === "condition" && value !== "all") ||
                        (key !== "category" && key !== "timeFilter" && key !== "condition" && value),
                    ).length
                  }
                </Badge>
              )}
            </Button>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop sidebar */}
        {!isMobile && filtersOpen && (
          <div className="w-full md:w-80 shrink-0">
            <EnhancedFilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              timeFilter={timeFilter}
              condition={condition}
              location={location}
              onFilterChange={updateFilters}
            />
          </div>
        )}

        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}
