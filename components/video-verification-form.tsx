"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, AlertTriangle, Video, X, Play, Pause, Upload, CheckCircle, XCircle, Clock } from "lucide-react"

interface VerificationResult {
  isVerified: boolean
  message: string
  prediction?: string
  matchScore?: number
  status?: string
  confidence?: number
  details?: {
    prediction?: string
    matchScore?: number
    status?: string
    confidence?: number
    categories?: string[]
    processingTime?: number
  }
}

interface VideoVerificationFormProps {
  onVerificationComplete?: (result: VerificationResult) => void
  className?: string
}

export default function VideoVerificationForm({ onVerificationComplete, className = "" }: VideoVerificationFormProps) {
  const { toast } = useToast()
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle")
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

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
          description: "Please upload a video file (MP4, MOV, WEBM)",
        })
        return
      }

      setSelectedVideo(file)

      // Create preview URL
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
      const url = URL.createObjectURL(file)
      setVideoPreviewUrl(url)

      // Reset verification state
      resetVerificationState()
    }
  }

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setSelectedVideo(null)
    setVideoPreviewUrl(null)
    resetVerificationState()
  }

  const resetVerificationState = () => {
    setVerificationStatus("idle")
    setVerificationResult(null)
    setUploadProgress(0)
  }

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const simulateProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 300)

    return () => clearInterval(interval)
  }

  const verifyVideo = async () => {
    if (!selectedVideo) {
      toast({
        variant: "destructive",
        title: "No video selected",
        description: "Please upload a video file first",
      })
      return
    }

    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Description required",
        description: "Please provide a description of your product",
      })
      return
    }

    setIsVerifying(true)
    setVerificationStatus("uploading")
    const stopProgress = simulateProgress()

    try {
      // Create FormData for multipart request
      const formData = new FormData()
      formData.append("video", selectedVideo)
      formData.append("description", description.trim())

      setVerificationStatus("processing")

      // Call local FastAPI service directly from client
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(100)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      const result: VerificationResult = {
        isVerified: data.status === "verified",
        message: data.message || "Verification completed",
        prediction: data.prediction,
        matchScore: data.match_score,
        status: data.status,
        confidence: data.confidence,
        details: {
          prediction: data.prediction,
          matchScore: data.match_score,
          status: data.status,
          confidence: data.confidence,
          categories: data.categories,
          processingTime: data.processing_time,
        },
      }

      setVerificationResult(result)

      if (result.isVerified) {
        setVerificationStatus("success")
        toast({
          title: "Verification successful",
          description: `Product identified as: ${result.prediction}`,
        })
      } else {
        setVerificationStatus("error")
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: result.message,
        })
      }

      // Call callback if provided
      onVerificationComplete?.(result)
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus("error")

      let errorMessage = "An error occurred during verification"
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage =
          "Cannot connect to verification service. Please ensure the FastAPI service is running on localhost:8000"
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      const errorResult: VerificationResult = {
        isVerified: false,
        message: errorMessage,
      }

      setVerificationResult(errorResult)
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: errorMessage,
      })

      onVerificationComplete?.(errorResult)
    } finally {
      stopProgress()
      setIsVerifying(false)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (verificationStatus) {
      case "uploading":
        return "Uploading video..."
      case "processing":
        return "Processing with AI..."
      case "success":
        return "Verification successful"
      case "error":
        return "Verification failed"
      default:
        return "Ready to verify"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Upload */}
        <div className="space-y-2">
          <Label htmlFor="video">Product Video</Label>
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
              <video
                ref={videoRef}
                src={videoPreviewUrl}
                className="w-full h-auto rounded-lg max-h-64 object-cover"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                controls
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={toggleVideoPlayback}>
                  {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={removeVideo}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Product Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your product in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Verification Status */}
        {verificationStatus !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>
              {verificationResult?.matchScore && (
                <Badge variant={verificationResult.matchScore > 0.7 ? "default" : "secondary"}>
                  {(verificationResult.matchScore * 100).toFixed(1)}% match
                </Badge>
              )}
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Verification Results */}
        {verificationResult && (
          <div className="space-y-3">
            <Alert variant={verificationResult.isVerified ? "default" : "destructive"}>
              {verificationResult.isVerified ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{verificationResult.message}</AlertDescription>
            </Alert>

            {verificationResult.details && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <h4 className="text-sm font-medium">Verification Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {verificationResult.details.prediction && (
                    <div>
                      <span className="text-muted-foreground">Detected:</span>
                      <div className="font-medium">{verificationResult.details.prediction}</div>
                    </div>
                  )}
                  {verificationResult.details.matchScore && (
                    <div>
                      <span className="text-muted-foreground">Match Score:</span>
                      <div className="font-medium">{(verificationResult.details.matchScore * 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {verificationResult.details.confidence && (
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <div className="font-medium">{(verificationResult.details.confidence * 100).toFixed(1)}%</div>
                    </div>
                  )}
                  {verificationResult.details.status && (
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={verificationResult.details.status === "verified" ? "default" : "destructive"}
                        className="ml-1"
                      >
                        {verificationResult.details.status}
                      </Badge>
                    </div>
                  )}
                </div>
                {verificationResult.details.categories && verificationResult.details.categories.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {verificationResult.details.categories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verify Button */}
        <Button
          onClick={verifyVideo}
          disabled={isVerifying || !selectedVideo || !description.trim()}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : verificationResult?.isVerified ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Verified
            </>
          ) : (
            "Verify Product"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
