"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Tag, DollarSign } from "lucide-react"

interface EnhancedFilterSidebarProps {
  minPrice: string
  maxPrice: string
  timeFilter: string
  condition?: string
  location?: string
  onFilterChange: (params: Record<string, string>) => void
  onClose?: () => void
}

// Indian cities and states data
const indianLocations = {
  states: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
  ],
  majorCities: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Ahmedabad",
    "Chennai",
    "Kolkata",
    "Surat",
    "Pune",
    "Jaipur",
    "Lucknow",
    "Kanpur",
    "Nagpur",
    "Indore",
    "Thane",
    "Bhopal",
    "Visakhapatnam",
    "Pimpri-Chinchwad",
    "Patna",
    "Vadodara",
    "Ghaziabad",
    "Ludhiana",
    "Agra",
    "Nashik",
    "Faridabad",
    "Meerut",
    "Rajkot",
    "Kalyan-Dombivli",
    "Vasai-Virar",
    "Varanasi",
    "Srinagar",
    "Aurangabad",
    "Dhanbad",
    "Amritsar",
    "Navi Mumbai",
    "Allahabad",
    "Ranchi",
    "Howrah",
    "Coimbatore",
    "Jabalpur",
  ],
}

const categories = [
  { id: "all", name: "All Categories", icon: "🏷️" },
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "collectibles", name: "Collectibles", icon: "🏺" },
  { id: "fashion", name: "Fashion", icon: "👗" },
  { id: "home", name: "Home & Garden", icon: "🏠" },
  { id: "art", name: "Art", icon: "🎨" },
  { id: "books", name: "Books", icon: "📚" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "automotive", name: "Automotive", icon: "🚗" },
  { id: "jewelry", name: "Jewelry", icon: "💎" },
  { id: "other", name: "Other", icon: "📦" },
]

export default function EnhancedFilterSidebar({
  minPrice,
  maxPrice,
  timeFilter,
  condition = "all",
  location = "",
  onFilterChange,
  onClose,
}: EnhancedFilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? Number.parseFloat(minPrice) : 0,
    maxPrice ? Number.parseFloat(maxPrice) : 100000,
  ])
  const [localTimeFilter, setLocalTimeFilter] = useState(timeFilter || "all")
  const [localCondition, setLocalCondition] = useState(condition || "all")
  const [localLocation, setLocalLocation] = useState(location || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isDragging, setIsDragging] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setPriceRange([minPrice ? Number.parseFloat(minPrice) : 0, maxPrice ? Number.parseFloat(maxPrice) : 100000])
    setLocalTimeFilter(timeFilter || "all")
    setLocalCondition(condition || "all")
    setLocalLocation(location || "")
  }, [minPrice, maxPrice, timeFilter, condition, location])

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]])
    setIsDragging(true)
  }

  const handlePriceChangeEnd = () => {
    setIsDragging(false)
    onFilterChange({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    })
  }

  const handleTimeFilterChange = (value: string) => {
    setLocalTimeFilter(value)
    onFilterChange({ timeFilter: value })
  }

  const handleConditionChange = (value: string) => {
    setLocalCondition(value)
    onFilterChange({ condition: value })
  }

  const handleLocationChange = (value: string) => {
    setLocalLocation(value)
    onFilterChange({ location: value })
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onFilterChange({ category: value })
  }

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalLocation(value)
    // Debounce location filter
    setTimeout(() => {
      onFilterChange({ location: value })
    }, 500)
  }

  const clearAllFilters = () => {
    setPriceRange([0, 100000])
    setLocalTimeFilter("all")
    setLocalCondition("all")
    setLocalLocation("")
    setSelectedCategory("all")
    onFilterChange({
      minPrice: "",
      maxPrice: "",
      timeFilter: "all",
      condition: "all",
      location: "",
      category: "all",
    })
  }

  const activeFiltersCount = [
    priceRange[0] > 0 || priceRange[1] < 100000,
    localTimeFilter !== "all",
    localCondition !== "all",
    localLocation !== "",
    selectedCategory !== "all",
  ].filter(Boolean).length

  return (
    <div className="bg-card rounded-lg border p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Filters</h3>
          {activeFiltersCount > 0 && <Badge variant="secondary">{activeFiltersCount}</Badge>}
        </div>
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="price" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="price" className="text-xs">
            <DollarSign className="h-3 w-3 mr-1" />
            Price
          </TabsTrigger>
          <TabsTrigger value="category" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            Category
          </TabsTrigger>
          <TabsTrigger value="time" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Time
          </TabsTrigger>
          <TabsTrigger value="location" className="text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            Location
          </TabsTrigger>
        </TabsList>

        <TabsContent value="price" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Price Range</Label>
            <Slider
              defaultValue={[0, 100000]}
              min={0}
              max={100000}
              step={1000}
              value={priceRange}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceChangeEnd}
              className="my-6"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="min-price" className="text-xs text-muted-foreground mb-1 block">
                  Minimum
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="min-price"
                    type="number"
                    min={0}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 0
                      setPriceRange([value, priceRange[1]])
                    }}
                    onBlur={() =>
                      onFilterChange({
                        minPrice: priceRange[0].toString(),
                        maxPrice: priceRange[1].toString(),
                      })
                    }
                    className="pl-6"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="max-price" className="text-xs text-muted-foreground mb-1 block">
                  Maximum
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="max-price"
                    type="number"
                    min={0}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value) || 100000
                      setPriceRange([priceRange[0], value])
                    }}
                    onBlur={() =>
                      onFilterChange({
                        minPrice: priceRange[0].toString(),
                        maxPrice: priceRange[1].toString(),
                      })
                    }
                    className="pl-6"
                  />
                </div>
              </div>
            </div>
            <div className="text-sm text-center mt-2 p-2 bg-muted rounded">
              {isDragging ? (
                <span className="text-primary font-medium">
                  ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </span>
              ) : (
                <span className="text-muted-foreground">Drag slider or enter values</span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Product Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(cat.id)}
                  className="justify-start text-xs h-auto py-2"
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Auction End Time</Label>
            <RadioGroup value={localTimeFilter} onValueChange={handleTimeFilterChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="time-all" />
                <Label htmlFor="time-all" className="cursor-pointer text-sm">
                  All Auctions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ending-soon" id="ending-soon" />
                <Label htmlFor="ending-soon" className="cursor-pointer text-sm">
                  Ending Soon (24h)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="today" id="today" />
                <Label htmlFor="today" className="cursor-pointer text-sm">
                  Ending Today
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="this-week" id="this-week" />
                <Label htmlFor="this-week" className="cursor-pointer text-sm">
                  This Week
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="next-week" id="next-week" />
                <Label htmlFor="next-week" className="cursor-pointer text-sm">
                  Next Week
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-medium">Product Condition</Label>
              <RadioGroup value={localCondition} onValueChange={handleConditionChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="condition-all" />
                  <Label htmlFor="condition-all" className="cursor-pointer text-sm">
                    All Conditions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="condition-new" />
                  <Label htmlFor="condition-new" className="cursor-pointer text-sm">
                    Brand New
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="like-new" id="condition-like-new" />
                  <Label htmlFor="condition-like-new" className="cursor-pointer text-sm">
                    Like New
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="condition-excellent" />
                  <Label htmlFor="condition-excellent" className="cursor-pointer text-sm">
                    Excellent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="condition-good" />
                  <Label htmlFor="condition-good" className="cursor-pointer text-sm">
                    Good
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="condition-fair" />
                  <Label htmlFor="condition-fair" className="cursor-pointer text-sm">
                    Fair
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="condition-poor" />
                  <Label htmlFor="condition-poor" className="cursor-pointer text-sm">
                    Poor
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Seller Location</Label>

            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Search city or state..."
                value={localLocation}
                onChange={handleLocationInput}
                className="w-full"
              />

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Popular Cities</Label>
                <div className="grid grid-cols-2 gap-1">
                  {indianLocations.majorCities.slice(0, 8).map((city) => (
                    <Button
                      key={city}
                      variant={localLocation === city ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleLocationChange(city)}
                      className="justify-start text-xs h-auto py-1"
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Select State</Label>
                <Select value={localLocation} onValueChange={handleLocationChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {indianLocations.states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
