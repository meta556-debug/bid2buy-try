"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle } from "lucide-react"

interface ApiStatus {
  isOnline: boolean
  responseTime?: number
  lastChecked: Date
  error?: string
}

export default function ApiStatusIndicator() {
  const [status, setStatus] = useState<ApiStatus>({
    isOnline: false,
    lastChecked: new Date(),
  })
  const [isChecking, setIsChecking] = useState(false)

  const checkApiStatus = async () => {
    setIsChecking(true)
    const startTime = Date.now()

    try {
      const response = await fetch("http://localhost:8000/health", {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        setStatus({
          isOnline: true,
          responseTime,
          lastChecked: new Date(),
        })
      } else {
        setStatus({
          isOnline: false,
          lastChecked: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`,
        })
      }
    } catch (error) {
      setStatus({
        isOnline: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "Connection failed",
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkApiStatus()

    // Check status every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          FastAPI Service Status
          <Button variant="ghost" size="sm" onClick={checkApiStatus} disabled={isChecking}>
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status:</span>
          <Badge variant={status.isOnline ? "default" : "destructive"}>
            {status.isOnline ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {status.responseTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Response Time:</span>
            <span className="text-sm text-muted-foreground">{status.responseTime}ms</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Checked:</span>
          <span className="text-sm text-muted-foreground">{status.lastChecked.toLocaleTimeString()}</span>
        </div>

        {!status.isOnline && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {status.error || "FastAPI service is not responding"}
              <br />
              <span className="text-xs">Make sure the service is running on localhost:8000</span>
            </AlertDescription>
          </Alert>
        )}

        {status.isOnline && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>FastAPI service is running and ready for video verification.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
