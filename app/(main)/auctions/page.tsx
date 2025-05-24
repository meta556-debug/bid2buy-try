"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EnhancedFilterSidebar from "@/components/enhanced-filter-sidebar"
import RealTimeAuctionList from "@/components/real-time-auction-list"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, SlidersHorizontal, X, Grid, List, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import Link from "next/link"

const categories = [
  { id: "all", name: "All Categories" },
  { id: "electronics", name: "Electronics" },
  { id: "collectibles", name: "Collectibles" },
  { id: "fashion", name: "Fashion" },
  { id: "home", name: "Home & Garden" },
  { id: "art", name: "Art" },
  { id: "books", name: "Books" },
  { id: "sports", name: "Sports" },
  { id: "automotive", name: "Automotive" },
  { id: "jewelry", name: "Jewelry" },
  { id: "other", name: "Other" },
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "ending-soon", label: "Ending Soon" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "most-bids", label: "Most Bids" },
]

export default function AuctionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isMobile = useIsMobile()

  const category = searchParams.get("category") || "all"
  const search = searchParams.get("q") || ""
  const sort = searchParams.get("sort") || "newest"
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const timeFilter = searchParams.get("timeFilter") || "all"
  const condition = searchParams.get("condition") || "all"
  const location = searchParams.get("location") || ""

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const updateFilters = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        urlParams.set(key, value)
      } else {
        urlParams.delete(key)
      }
    })

    router.push(`/auctions?${urlParams.toString()}`)
  }

  const handleSortChange = (value: string) => {
    updateFilters({ sort: value })
  }

  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value })
  }

  const clearFilters = () => {
    router.push("/auctions")
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

  const activeFiltersCount = [
    category !== "all",
    !!search,
    sort !== "newest",
    !!minPrice,
    !!maxPrice,
    timeFilter !== "all",
    condition !== "all",
    !!location,
  ].filter(Boolean).length

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Live Auctions</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {search && (
              <span>
                Searching for "<span className="font-medium text-foreground">{search}</span>"
              </span>
            )}
            {hasActiveFilters && (
              <Badge variant="secondary">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} applied
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link href="/create-auction">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Auction
            </Button>
          </Link>

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

          <div className="flex gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>

          {isMobile ? (
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
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
                  {activeFiltersCount}
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

      {/* Category Tabs */}
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
          <RealTimeAuctionList
            category={category}
            search={search}
            sort={sort}
            minPrice={minPrice ? Number.parseFloat(minPrice) : undefined}
            maxPrice={maxPrice ? Number.parseFloat(maxPrice) : undefined}
            timeFilter={timeFilter}
            condition={condition}
            location={location}
          />
        </div>
      </div>
    </div>
  )
}
