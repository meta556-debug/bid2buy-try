"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle2, Video, ArrowRight, Users, Shield, Zap } from "lucide-react"
import { getProducts } from "@/app/actions/product-actions"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function LandingPage() {
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
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm dark:bg-blue-900">
                  🎯 AI-Powered Auction Platform
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Discover Unique Items at BidToBuy
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300">
                  Join India's premier video-verified auction marketplace. Bid on exclusive items or sell your treasures
                  with AI-powered verification and real-time bidding.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="#browse">Browse as Guest</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>AI Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Real-time Bidding</span>
                </div>
              </div>
            </div>
            <div className="mx-auto lg:mr-0 lg:ml-auto">
              <div className="relative">
                <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 shadow-2xl">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 mx-auto w-fit">
                        <Play className="h-12 w-12 text-blue-600" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">Watch Demo Video</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">AI Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose BidToBuy?</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl dark:text-gray-400">
                Experience the future of online auctions with our innovative features.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900 rounded-full p-3 w-fit mb-4">
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Video Verification</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Upload videos of your items for AI-powered authenticity verification and enhanced buyer confidence.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full p-3 w-fit mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Secure Transactions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Built-in wallet system with secure payment processing and fraud protection for safe transactions.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto bg-purple-100 dark:bg-purple-900 rounded-full p-3 w-fit mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Real-time Bidding</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Live auction updates with instant notifications and countdown timers for exciting bidding experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section id="browse" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Auctions</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl dark:text-gray-400">
                Discover our most exciting video-verified auctions currently live on the platform.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[240px] w-full rounded-lg" />
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
                    className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-lg border-0 shadow-md"
                  >
                    <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                      {product.mediaType === "video" && product.videoUrl ? (
                        <div className="relative w-full h-full">
                          <video
                            src={product.videoUrl}
                            className="object-cover w-full h-full"
                            muted
                            loop
                            poster={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="h-6 w-6 text-gray-800" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      )}

                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {product.aiVerified && (
                          <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                        {product.mediaType === "video" && (
                          <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                            <Video className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 flex-grow">
                      <h3 className="font-semibold text-lg truncate mb-2">{product.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">by {product.seller?.name}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Current Bid</p>
                          <p className="font-bold text-xl text-green-600">{formatCurrency(product.currentPrice)}</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {product._count?.bids || 0} bids
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/login">Login to View All Auctions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl dark:text-gray-400">
                Get started with BidToBuy in three simple steps.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Upload & Verify</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Record a video of your item and add a description. Our AI will verify authenticity and quality.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">List Your Auction</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Set your starting price and auction duration. Your verified listing goes live instantly.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Start Earning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Watch bids come in real-time and earn money from your items with secure transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Start Bidding?</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl dark:text-gray-400">
                Join thousands of users buying and selling on India's most trusted auction platform.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="/register">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Already have an account?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
