"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency } from "@/lib/utils"

interface FilterSidebarProps {
  minPrice: string
  maxPrice: string
  timeFilter: string
  condition?: string
  location?: string
  onFilterChange: (params: Record<string, string>) => void
  onClose?: () => void
}

export default function FilterSidebar({
  minPrice,
  maxPrice,
  timeFilter,
  condition = "all",
  location = "",
  onFilterChange,
  onClose,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? Number.parseFloat(minPrice) : 0,
    maxPrice ? Number.parseFloat(maxPrice) : 10000,
  ])
  const [localTimeFilter, setLocalTimeFilter] = useState(timeFilter || "all")
  const [localCondition, setLocalCondition] = useState(condition || "all")
  const [localLocation, setLocalLocation] = useState(location || "")
  const [isDragging, setIsDragging] = useState(false)

  // Update local state when props change
  useEffect(() => {
    setPriceRange([minPrice ? Number.parseFloat(minPrice) : 0, maxPrice ? Number.parseFloat(maxPrice) : 10000])
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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalLocation(value)
    // Debounce location filter
    setTimeout(() => {
      onFilterChange({ location: value })
    }, 500)
  }

  const handleMinPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      setPriceRange([value, priceRange[1]])
    }
  }

  const handleMaxPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (!isNaN(value)) {
      setPriceRange([priceRange[0], value])
    }
  }

  const handleInputBlur = () => {
    onFilterChange({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    })
  }

  return (
    <div className="bg-card rounded-lg border p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Price Range</Label>
          <Slider
            defaultValue={[0, 10000]}
            min={0}
            max={10000}
            step={10}
            value={priceRange}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            className="my-6"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground mb-1 block">
                Min
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="min-price"
                  type="number"
                  min={0}
                  value={priceRange[0]}
                  onChange={handleMinPriceInput}
                  onBlur={handleInputBlur}
                  className="pl-6"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground mb-1 block">
                Max
              </Label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="max-price"
                  type="number"
                  min={0}
                  value={priceRange[1]}
                  onChange={handleMaxPriceInput}
                  onBlur={handleInputBlur}
                  className="pl-6"
                />
              </div>
            </div>
          </div>
          <div className="text-sm text-center mt-2">
            {isDragging ? (
              <span className="text-primary font-medium">
                {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </span>
            ) : (
              <span className="text-muted-foreground">Drag the slider to set price range</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <RadioGroup value={localCondition} onValueChange={handleConditionChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="condition-all" />
              <Label htmlFor="condition-all" className="cursor-pointer">
                All Conditions
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="condition-new" />
              <Label htmlFor="condition-new" className="cursor-pointer">
                New
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="like-new" id="condition-like-new" />
              <Label htmlFor="condition-like-new" className="cursor-pointer">
                Like New
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="condition-good" />
              <Label htmlFor="condition-good" className="cursor-pointer">
                Good
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fair" id="condition-fair" />
              <Label htmlFor="condition-fair" className="cursor-pointer">
                Fair
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="condition-poor" />
              <Label htmlFor="condition-poor" className="cursor-pointer">
                Poor
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Time Ending</Label>
          <RadioGroup value={localTimeFilter} onValueChange={handleTimeFilterChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">
                All
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ending-soon" id="ending-soon" />
              <Label htmlFor="ending-soon" className="cursor-pointer">
                Ending Soon (24h)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="today" id="today" />
              <Label htmlFor="today" className="cursor-pointer">
                Today
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="this-week" id="this-week" />
              <Label htmlFor="this-week" className="cursor-pointer">
                This Week
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            placeholder="Enter city or zip code"
            value={localLocation}
            onChange={handleLocationChange}
          />
          <p className="text-xs text-muted-foreground">Filter by seller location</p>
        </div>
      </div>
    </div>
  )
}
