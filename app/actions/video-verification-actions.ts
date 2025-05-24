"use server"

export async function verifyProductVideo(formData: FormData) {
  try {
    const video = formData.get("video") as File
    const description = formData.get("description") as string

    if (!video || !description) {
      return {
        isVerified: false,
        message: "Video and description are required for verification",
      }
    }

    // Create new FormData for the API call
    const apiFormData = new FormData()
    apiFormData.append("video", video)
    apiFormData.append("description", description)

    // Call local FastAPI service
    const response = await fetch("http://localhost:8000/predict/", {
      method: "POST",
      body: apiFormData,
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          isVerified: false,
          message: "Verification service not available. Please ensure the AI service is running on localhost:8000",
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
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
        confidence: data.confidence || null,
        categories: data.categories || null,
        processingTime: data.processing_time || null,
      },
    }
  } catch (error) {
    console.error("Video verification error:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        isVerified: false,
        message:
          "Cannot connect to verification service. Please ensure the FastAPI service is running on localhost:8000",
      }
    }

    return {
      isVerified: false,
      message: "An error occurred during verification. Please try again.",
    }
  }
}
