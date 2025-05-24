"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createProduct } from "@/app/actions/product-actions"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Upload,
  X,
  ImageIcon,
  Video,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
} from "lucide-react"
import VideoVerificationForm from "@/components/video-verification-form"

const categories = [
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

const conditions = [
  { id: "new", name: "Brand New", description: "Never used, in original packaging" },
  { id: "like-new", name: "Like New", description: "Barely used, excellent condition" },
  { id: "excellent", name: "Excellent", description: "Minor signs of use, works perfectly" },
  { id: "good", name: "Good", description: "Some wear, fully functional" },
  { id: "fair", name: "Fair", description: "Noticeable wear, works as intended" },
  { id: "poor", name: "Poor", description: "Heavy wear, may need repairs" },
]

const indianCities = [
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
]

export default function CreateAuctionForm() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    category: "",
    condition: "",
    location: "",
    durationType: "days",
    durationValue: "7",
    mediaType: "image" as "image" | "video",
  })

  // Media state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  // Verification state
  const [useAIVerification, setUseAIVerification] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      // Validate file count
      if (files.length > 10) {
        toast({
          variant: "destructive",
          title: "Too many images",
          description: "You can upload a maximum of 10 images",
        })
        return
      }

      // Validate file sizes and types
      const validFiles = files.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
          })
          return false
        }
        if (!file.type.startsWith("image/")) {
          toast({
            variant: "destructive",
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
          })
          return false
        }
        return true
      })

      setSelectedImages(validFiles)

      // Create previews
      const previews = validFiles.map((file) => URL.createObjectURL(file))
      setImagePreviews(previews)

      // Reset verification if switching media types
      if (formData.mediaType === "video") {
        setIsVerified(false)
        setVerificationResult(null)
      }
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size
      if (file.size > 100 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Video file must be less than 100MB",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("video/")) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a video file",
        })
        return
      }

      setSelectedVideo(file)
      setVideoPreview(URL.createObjectURL(file))

      // Reset verification
      setIsVerified(false)
      setVerificationResult(null)
    }
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)

    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])

    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
  }

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setSelectedVideo(null)
    setVideoPreview(null)
    setIsVerified(false)
    setVerificationResult(null)
  }

  const handleMediaTypeChange = (type: "image" | "video") => {
    setFormData((prev) => ({ ...prev, mediaType: type }))

    // Clear opposite media type
    if (type === "image") {
      removeVideo()
    } else {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
      setSelectedImages([])
      setImagePreviews([])
    }

    setIsVerified(false)
    setVerificationResult(null)
  }

  const handleVerificationComplete = (result: any) => {
    setVerificationResult(result)
    setIsVerified(result.isVerified)
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!formData.title.trim()) errors.push("Title is required")
    if (!formData.description.trim()) errors.push("Description is required")
    if (!formData.startingPrice || Number.parseFloat(formData.startingPrice) <= 0) {
      errors.push("Valid starting price is required")
    }
    if (!formData.category) errors.push("Category is required")
    if (!formData.condition) errors.push("Condition is required")
    if (!formData.location) errors.push("Location is required")

    if (formData.mediaType === "image" && selectedImages.length === 0) {
      errors.push("At least one image is required")
    }
    if (formData.mediaType === "video" && !selectedVideo) {
      errors.push("Video is required")
    }

    if (useAIVerification && !isVerified) {
      errors.push("AI verification is required")
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Form validation failed",
        description: errors[0],
      })
      return
    }

    setIsLoading(true)

    try {
      const submitFormData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value)
      })

      // Add media files
      if (formData.mediaType === "image") {
        selectedImages.forEach((image) => {
          submitFormData.append("images", image)
        })
      } else {
        if (selectedVideo) {
          submitFormData.append("video", selectedVideo)
        }
      }

      // Add verification data
      submitFormData.append("aiVerified", isVerified.toString())
      if (verificationResult) {
        submitFormData.append("verificationData", JSON.stringify(verificationResult))
      }

      const result = await createProduct(submitFormData)

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error creating auction",
          description: result.error,
        })
      } else if (result.success) {
        toast({
          title: "Auction created successfully!",
          description: "Your item has been listed for auction.",
        })

        // Clean up URLs
        imagePreviews.forEach((preview) => URL.revokeObjectURL(preview))
        if (videoPreview) URL.revokeObjectURL(videoPreview)

        // Redirect to the auction page
        router.push(`/auction/${result.productId}`)
      }
    } catch (error) {
      console.error("Error creating auction:", error)
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDurationHelperText = () => {
    const now = new Date()
    const endDate = new Date()
    const value = Number.parseInt(formData.durationValue)

    switch (formData.durationType) {
      case "hours":
        endDate.setHours(now.getHours() + value)
        break
      case "days":
        endDate.setDate(now.getDate() + value)
        break
      case "weeks":
        endDate.setDate(now.getDate() + value * 7)
        break
    }

    return `Auction will end on ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title for your item"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">{formData.title.length}/100 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about your item, including its features, history, and any defects"
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">{formData.description.length}/2000 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{condition.name}</span>
                            <span className="text-xs text-muted-foreground">{condition.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {indianCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {city}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="startingPrice"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    value={formData.startingPrice}
                    onChange={(e) => handleInputChange("startingPrice", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Set a competitive starting price to attract bidders</p>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Auction Duration *
                </Label>

                <RadioGroup
                  value={formData.durationType}
                  onValueChange={(value) => handleInputChange("durationType", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hours" id="hours" />
                    <Label htmlFor="hours">Hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="days" id="days" />
                    <Label htmlFor="days">Days</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weeks" id="weeks" />
                    <Label htmlFor="weeks">Weeks</Label>
                  </div>
                </RadioGroup>

                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={formData.durationType === "hours" ? 72 : formData.durationType === "days" ? 30 : 8}
                    value={formData.durationValue}
                    onChange={(e) => handleInputChange("durationValue", e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{formData.durationType}</span>
                </div>

                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>{getDurationHelperText()}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Media Upload *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Media Type</Label>
                <RadioGroup
                  value={formData.mediaType}
                  onValueChange={(value: "image" | "video") => handleMediaTypeChange(value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image-type" />
                    <Label htmlFor="image-type" className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="video" id="video-type" />
                    <Label htmlFor="video-type" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.mediaType === "image" ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mb-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                    <p className="text-sm text-muted-foreground">Upload up to 10 images (max 10MB each)</p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2" variant="secondary">
                              Main
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!videoPreview ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <Input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => videoInputRef.current?.click()}
                        className="mb-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Video
                      </Button>
                      <p className="text-sm text-muted-foreground">Upload a video (max 100MB)</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <video src={videoPreview} className="w-full h-64 object-cover rounded-lg" controls />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                AI Verification
                <Switch checked={useAIVerification} onCheckedChange={setUseAIVerification} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {useAIVerification ? (
                <div className="space-y-4">
                  {(formData.mediaType === "image" && selectedImages.length > 0) ||
                  (formData.mediaType === "video" && selectedVideo) ? (
                    <VideoVerificationForm onVerificationComplete={handleVerificationComplete} />
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>Please upload media files to enable verification.</AlertDescription>
                    </Alert>
                  )}

                  {isVerified && verificationResult && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        Product verified successfully! Detected as: {verificationResult.prediction}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  AI verification is disabled. Your listing will not be verified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Title:</span>{" "}
                <span className="text-muted-foreground">{formData.title || "Enter title..."}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Starting Price:</span>{" "}
                <span className="text-green-600 font-semibold">₹{formData.startingPrice || "0"}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Category:</span>{" "}
                <span className="text-muted-foreground">
                  {categories.find((c) => c.id === formData.category)?.name || "Select category..."}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Condition:</span>{" "}
                <span className="text-muted-foreground">
                  {conditions.find((c) => c.id === formData.condition)?.name || "Select condition..."}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Location:</span>{" "}
                <span className="text-muted-foreground">{formData.location || "Select location..."}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || (useAIVerification && !isVerified)} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Auction"
          )}
        </Button>
      </div>
    </form>
  )
}
