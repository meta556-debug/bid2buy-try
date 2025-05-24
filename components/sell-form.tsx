"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProduct } from "@/app/actions/product-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, AlertTriangle, X, Upload } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import VideoVerificationForm from "@/components/video-verification-form"

export default function SellForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [useAIVerification, setUseAIVerification] = useState(true)
  const [durationType, setDurationType] = useState("days")
  const [durationValue, setDurationValue] = useState(7)
  const [description, setDescription] = useState("")

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Validate file size (max 100MB)
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

      // Create preview URL
      const url = URL.createObjectURL(file)
      setVideoPreviewUrl(url)

      // Reset verification state
      setIsVerified(false)
      setVerificationResult(null)
    }
  }

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setSelectedVideo(null)
    setVideoPreviewUrl(null)
    setIsVerified(false)
    setVerificationResult(null)
  }

  const handleVerificationComplete = (result: any) => {
    setVerificationResult(result)
    setIsVerified(result.isVerified)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useAIVerification && !isVerified) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please verify your product before submitting",
      })
      return
    }

    if (!selectedVideo) {
      toast({
        variant: "destructive",
        title: "Video required",
        description: "Please upload a video of your product",
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    formData.append("aiVerified", isVerified.toString())
    formData.append("durationType", durationType)
    formData.append("durationValue", durationValue.toString())
    formData.append("mediaType", "video")

    // Add video to form data
    if (selectedVideo) {
      formData.append("video", selectedVideo)
    }

    // Add verification results if available
    if (verificationResult) {
      formData.append("verificationData", JSON.stringify(verificationResult))
    }

    const result = await createProduct(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
      setIsLoading(false)
    } else if (result.success) {
      toast({
        title: "Success",
        description: result.success,
      })

      router.push(`/auction/${result.productId}`)
    }
  }

  const getDurationHelperText = () => {
    const now = new Date()
    const endDate = new Date()

    switch (durationType) {
      case "hours":
        endDate.setHours(now.getHours() + durationValue)
        break
      case "days":
        endDate.setDate(now.getDate() + durationValue)
        break
      case "weeks":
        endDate.setDate(now.getDate() + durationValue * 7)
        break
    }

    return `Auction will end on ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Product title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your product in detail"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting Price ($)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="startingPrice"
                name="startingPrice"
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Auction Duration</Label>
            <RadioGroup
              defaultValue="days"
              className="flex space-x-4 mb-2"
              value={durationType}
              onValueChange={setDurationType}
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
                min={durationType === "hours" ? 1 : 1}
                max={durationType === "hours" ? 72 : durationType === "days" ? 30 : 8}
                value={durationValue}
                onChange={(e) => setDurationValue(Number.parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{durationType}</span>
            </div>

            <p className="text-xs text-muted-foreground">{getDurationHelperText()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="collectibles">Collectibles</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select name="condition" required defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Product Video</Label>
            {!videoPreviewUrl ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <Input id="video" type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                <label htmlFor="video" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-muted-foreground">Click to upload a product video</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, WEBM up to 100MB</p>
                </label>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden">
                <video src={videoPreviewUrl} className="w-full h-auto rounded-lg" controls />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* AI Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                AI Verification
                <Switch checked={useAIVerification} onCheckedChange={setUseAIVerification} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {useAIVerification ? (
                <div className="space-y-4">
                  {selectedVideo && description ? (
                    <VideoVerificationForm onVerificationComplete={handleVerificationComplete} />
                  ) : (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Please upload a video and add a description to enable verification.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isVerified && verificationResult && (
                    <Alert>
                      <Check className="h-4 w-4" />
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
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || (useAIVerification && !isVerified)}>
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
