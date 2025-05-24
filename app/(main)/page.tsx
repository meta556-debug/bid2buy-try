"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { getProducts } from "../actions/product-actions"
import { getWalletBalance } from "../actions/wallet-actions"
import { getUserBids } from "../actions/product-actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import FilterSidebar from "@/components/filter-sidebar"
import ProductGrid from "@/components/product-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, SlidersHorizontal, X, Wallet, TrendingUp, Clock, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

// Landing page for non-logged-in users
function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await getProducts()
        setFeaturedProducts(products.slice(0, 6))
      } catch (error) {
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Discover Unique Items at BidToBuy
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Join our video-verified auction marketplace to bid on exclusive items or sell your own treasures with
                  AI-powered verification.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#browse">Browse Auctions</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:mr-0 lg:ml-auto">
              <div className="aspect-video overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Video Preview Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section id="browse" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Auctions</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Discover our most exciting video-verified auctions currently live on the platform.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start pt-10">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-6 w-1/4" />
                    </div>
                  </div>
                ))
              : featuredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md"
                  >
                    <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                      {product.mediaType === "video" && product.videoUrl ? (
                        <video
                          src={product.videoUrl}
                          className="object-cover w-full h-full"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <img
                          src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <CardContent className="p-4 flex-grow">
                      <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">by {product.seller?.name}</p>
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Bid</p>
                          <p className="font-semibold text-lg">{formatCurrency(product.currentPrice)}</p>
                        </div>
                        <Badge variant="outline">{product._count?.bids || 0} bids</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
          <div className="flex justify-center mt-10">
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Login to View All Auctions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                BidToBuy uses AI-powered video verification to ensure authentic, secure auctions.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 pt-10">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <h3 className="text-xl font-bold">Upload Video</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Record a short video of your item and add a description for AI verification.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <h3 className="text-xl font-bold">AI Verification</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Our AI analyzes your video and description to verify authenticity and quality.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-background">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <h3 className="text-xl font-bold">Start Bidding</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Once verified, your auction goes live and buyers can start placing bids.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Start?</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join thousands of users buying and selling on BidToBuy with AI-verified listings.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="/register">Sign Up Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Dashboard for logged-in users
function UserDashboard() {
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
  const [dashboardStats, setDashboardStats] = useState({
    activeBids: 0,
    watchingItems: 0,
    totalSpent: 0,
  })

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "electronics", name: "Electronics" },
    { id: "collectibles", name: "Collectibles" },
    { id: "fashion", name: "Fashion" },
    { id: "home", name: "Home & Garden" },
    { id: "art", name: "Art" },
    { id: "other", name: "Other" },
  ]

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "ending-soon", label: "Ending Soon" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "most-bids", label: "Most Bids" },
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

      // Calculate dashboard stats
      const activeBids = bids.filter(
        (bid) => bid.product.status === "ACTIVE" && new Date(bid.product.endTime) > new Date(),
      ).length

      const totalSpent = bids.reduce((sum, bid) => sum + bid.amount, 0)

      setDashboardStats({
        activeBids,
        watchingItems: bids.length,
        totalSpent,
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
  }, [category, search, sort, minPrice, maxPrice, timeFilter])

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

  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value })
  }

  const clearFilters = () => {
    router.push("/")
  }

  const hasActiveFilters =
    category !== "all" || !!search || sort !== "newest" || !!minPrice || !!maxPrice || timeFilter !== "all"

  return (
    <div className="container py-8">
      {/* Dashboard Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletBalance)}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/wallet" className="text-primary hover:underline">
                Add funds
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeBids}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/profile" className="text-primary hover:underline">
                View all bids
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watching</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.watchingItems}</div>
            <p className="text-xs text-muted-foreground">Items you've bid on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Across all bids</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Browse Auctions</h1>
          {search && (
            <p className="text-muted-foreground">
              Search results for: <span className="font-medium text-foreground">{search}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <FilterSidebar
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  timeFilter={timeFilter}
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
                <span className="ml-1 bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {
                    Object.entries({ category, search, minPrice, maxPrice, timeFilter }).filter(
                      ([key, value]) =>
                        (key === "category" && value !== "all") ||
                        (key === "timeFilter" && value !== "all") ||
                        (key !== "category" && key !== "timeFilter" && value),
                    ).length
                  }
                </span>
              )}
            </Button>
          )}

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop sidebar */}
        {!isMobile && filtersOpen && (
          <div className="w-full md:w-64 lg:w-72 shrink-0">
            <FilterSidebar
              minPrice={minPrice}
              maxPrice={maxPrice}
              timeFilter={timeFilter}
              onFilterChange={updateFilters}
            />
          </div>
        )}

        <div className="flex-1">
          <Tabs defaultValue={category} className="mb-8">
            <TabsList className="mb-4 flex flex-wrap h-auto">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? <ProductGridSkeleton /> : <ProductGrid products={products} />}
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
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
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="container py-8">
        <ProductGridSkeleton />
      </div>
    )
  }

  return session ? <UserDashboard /> : <LandingPage />
}
