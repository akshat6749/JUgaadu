"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, GraduationCap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "Jadavpur University", // Default college value
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    
    // Validate Jadavpur University email
    const emailRegex = /^[^\s@]+@jadavpuruniversity\.in$/i
    if (!emailRegex.test(formData.email)) {
      setError("Please use your official Jadavpur University email (@jadavpuruniversity.in)")
      return false
    }
    
    if (!formData.password) {
      setError("Password is required")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log("🔍 Signup form submission:", formData)

      await register(formData)

      console.log("✅ Registration successful, redirecting...")
      toast({
        title: "Account created successfully!",
        description: "Welcome to the Jadavpur University marketplace.",
      })

      // Small delay to show the success message
      setTimeout(() => {
        router.push("/marketplace")
      }, 1000)
    } catch (err) {
      console.error("❌ Signup form error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 px-4 py-8">
      <Card className="w-full max-w-md border-violet-200 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-violet-100 to-blue-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-violet-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Join JU Marketplace
          </CardTitle>
          <CardDescription className="text-violet-600">
            Create your account to access the Jadavpur University student marketplace
          </CardDescription>
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-3 rounded-lg border border-violet-200">
            <p className="text-sm text-violet-700 font-medium">
              📧 Only official Jadavpur University student emails (@jadavpuruniversity.in) are accepted
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-violet-700 font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-violet-700 font-medium">University Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.name@jadavpuruniversity.in"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
              />
              <p className="text-xs text-violet-600">
                Use your official JU student email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-violet-700 font-medium">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-violet-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-violet-50 text-violet-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-violet-700 font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-violet-50 text-violet-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-medium py-2.5" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-violet-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium underline decoration-blue-300 hover:decoration-blue-500">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}