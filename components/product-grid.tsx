"use client"

import ProductCard from "@/components/product-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, calculateTimeLeft } from "@/lib/utils"
import { Clock, Tag, User, Video, CheckCircle2, Play } from "lucide-react"
import Link from "next/link"

interface ProductGridProps {
  products: any[]
  viewMode?: "grid" | "list"
}

export default function ProductGrid({ products, viewMode = "grid" }: ProductGridProps) {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductListItem key={product.id} product={product} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductListItem({ product }: { product: any }) {
  const timeLeft = calculateTimeLeft(product.endTime)
  const isEnded = timeLeft.isEnded || product.status === "ENDED"
  const hasVideo = product.mediaType === "video"

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image/Video Section */}
          <div className="w-full sm:w-48 h-48 sm:h-32 relative">
            {hasVideo && product.videoUrl ? (
              <div className="relative w-full h-full">
                <video
                  src={product.videoUrl}
                  className="object-cover w-full h-full"
                  muted
                  loop
                  poster={product.images?.[0] || "/placeholder.svg?height=200&width=300"}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 rounded-full p-2">
                    <Play className="h-4 w-4 text-gray-800" />
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={product.images?.[0] || "/placeholder.svg?height=200&width=300"}
                alt={product.title}
                className="object-cover w-full h-full"
              />
            )}

            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {product.aiVerified && (
                <div className="bg-green-500 text-white p-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}
              {hasVideo && (
                <div className="bg-blue-500 text-white p-1 rounded-full">
                  <Video className="h-3 w-3" />
                </div>
              )}
            </div>

            {isEnded && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-xs">
                  Ended
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between h-full">
              <div className="flex-1">
                <Link href={`/auction/${product.id}`}>
                  <h3 className="font-semibold text-lg hover:underline line-clamp-2">{product.title}</h3>
                </Link>

                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span>{product.seller?.name || "Unknown Seller"}</span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{product.category}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {isEnded ? (
                      <span className="text-red-500">Ended</span>
                    ) : (
                      <span>
                        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
                        {timeLeft.hours}h {timeLeft.minutes}m
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col justify-between sm:justify-end items-end sm:items-end mt-4 sm:mt-0 sm:ml-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="font-semibold text-xl text-green-600">{formatCurrency(product.currentPrice)}</p>
                </div>
                <div className="text-sm text-muted-foreground sm:mt-2">
                  <span className="font-medium text-foreground">{product._count?.bids || 0}</span> bids
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
