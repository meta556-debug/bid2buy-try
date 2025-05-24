"use client"

import { useState, useEffect } from "react"
import { getProducts } from "@/app/actions/product-actions"
import ProductGrid from "@/components/product-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface RealTimeAuctionListProps {
  initialProducts?: any[]
  category?: string
  search?: string
  sort?: string
  minPrice?: number
  maxPrice?: number
  timeFilter?: string
  condition?: string
  location?: string
}

export default function RealTimeAuctionList({
  initialProducts = [],
  category,
  search,
  sort,
  minPrice,
  maxPrice,
  timeFilter,
  condition,
  location,
}: RealTimeAuctionListProps) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchProducts = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    setLoading(true)

    try {
      const fetchedProducts = await getProducts(
        category !== "all" ? category : undefined,
        search,
        sort,
        minPrice,
        maxPrice,
        timeFilter !== "all" ? timeFilter : undefined,
      )

      // Filter by condition and location on client side for now
      let filteredProducts = fetchedProducts

      if (condition && condition !== "all") {
        filteredProducts = filteredProducts.filter((p) => p.condition === condition)
      }

      if (location && location !== "") {
        filteredProducts = filteredProducts.filter((p) => p.location?.toLowerCase().includes(location.toLowerCase()))
      }

      setProducts(filteredProducts)
      setLastUpdated(new Date())

      // Show toast for new auctions (only if not initial load)
      if (showRefreshing && filteredProducts.length > products.length) {
        const newCount = filteredProducts.length - products.length
        toast({
          title: "New auctions found!",
          description: `${newCount} new auction${newCount > 1 ? "s" : ""} added`,
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load auctions. Please try again.",
      })
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchProducts(true)
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProducts(false)
    }, 30000)

    return () => clearInterval(interval)
  }, [category, search, sort, minPrice, maxPrice, timeFilter, condition, location])

  // Fetch when filters change
  useEffect(() => {
    fetchProducts(false)
  }, [category, search, sort, minPrice, maxPrice, timeFilter, condition, location])

  if (loading && products.length === 0) {
    return <ProductGridSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-xs">
            {products.length} auction{products.length !== 1 ? "s" : ""}
          </Badge>
          <span className="text-xs text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleManualRefresh} disabled={isRefreshing} className="text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No auctions found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later for new listings.</p>
          <Button onClick={handleManualRefresh} variant="outline">
            Refresh Listings
          </Button>
        </div>
      )}
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[240px] w-full rounded-lg" />
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
