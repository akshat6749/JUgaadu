"use client"
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

// This file is kept for backward compatibility
// All toast functionality now uses Sonner

export default Toaster

function Toast({ toast, onDismiss }) {
  const getIcon = () => {
    switch (toast.variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (toast.variant) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "destructive":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      default:
        return "bg-white border-gray-200 text-gray-800"
    }
  }

  return (
    <div
      className={`
        max-w-sm w-full p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        ${getStyles()}
      `}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {toast.title && <p className="font-medium text-sm">{toast.title}</p>}
          {toast.description && <p className="text-sm opacity-90 mt-1">{toast.description}</p>}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
