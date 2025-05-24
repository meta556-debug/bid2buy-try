import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateTimeLeft(endTime: string | Date) {
  const end = new Date(endTime)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isEnded: false,
  }
}

export function formatTimeLeft(endTime: string | Date): string {
  const timeLeft = calculateTimeLeft(endTime)

  if (timeLeft.isEnded) {
    return "Ended"
  }

  if (timeLeft.days > 0) {
    return `${timeLeft.days}d ${timeLeft.hours}h`
  }

  if (timeLeft.hours > 0) {
    return `${timeLeft.hours}h ${timeLeft.minutes}m`
  }

  return `${timeLeft.minutes}m ${timeLeft.seconds}s`
}
