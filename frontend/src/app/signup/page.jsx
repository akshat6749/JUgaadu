"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, GraduationCap, BookOpen, Users, ShoppingBag, Sparkles } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center px-4 py-8 lg:px-8">
          <div className="w-full max-w-md">
            <Card className="border-violet-200 shadow-xl animate-in slide-in-from-left-5 duration-700">
              <CardHeader className="space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="p-3 bg-gradient-to-br from-violet-100 to-blue-100 rounded-full animate-pulse">
                    <GraduationCap className="h-8 w-8 text-violet-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent animate-in fade-in-50 duration-1000 delay-200">
                  Join JU Marketplace
                </CardTitle>
                <CardDescription className="text-violet-600 animate-in fade-in-50 duration-1000 delay-300">
                  Create your account to access the Jadavpur University student marketplace
                </CardDescription>
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-3 rounded-lg border border-violet-200 animate-in slide-in-from-bottom-3 duration-1000 delay-400">
                  <p className="text-sm text-violet-700 font-medium">
                    📧 Only official Jadavpur University student emails (@jadavpuruniversity.in) are accepted
                  </p>
                </div>
              </CardHeader>
              <CardContent className="animate-in fade-in-50 duration-1000 delay-500">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50 animate-in slide-in-from-top-2 duration-300">
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
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 hover:border-violet-300"
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
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 hover:border-violet-300"
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
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 transition-all duration-200 hover:border-violet-300"
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
                        className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 pr-10 transition-all duration-200 hover:border-violet-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-violet-50 text-violet-600 transition-colors duration-200"
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
                        className="border-violet-200 focus:border-violet-400 focus:ring-violet-400 pr-10 transition-all duration-200 hover:border-violet-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-violet-50 text-violet-600 transition-colors duration-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-medium py-2.5 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]" 
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
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium underline decoration-blue-300 hover:decoration-blue-500 transition-colors duration-200">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - JUgaadu Branding */}
        <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-700 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce [animation-delay:0s]"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce [animation-delay:2s]"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-bounce [animation-delay:4s]"></div>
            <div className="absolute bottom-32 right-10 w-24 h-24 bg-white/10 rounded-full animate-bounce [animation-delay:1s]"></div>
            
            {/* Floating gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse [animation-delay:0.5s]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl animate-pulse [animation-delay:1.5s]"></div>
          </div>

          <div className="relative z-10 text-center text-white px-8 animate-in slide-in-from-right-5 duration-700">
            {/* Main Logo/Title */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-in zoom-in-50 duration-1000 delay-200">
                JU<span className="text-yellow-300">gaadu</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6 animate-in fade-in-50 duration-1000 delay-400">
                <Sparkles className="h-6 w-6 text-yellow-300 animate-spin [animation-duration:3s]" />
                <p className="text-xl text-blue-100">
                  Your Campus Marketplace
                </p>
                <Sparkles className="h-6 w-6 text-yellow-300 animate-spin [animation-duration:3s] [animation-delay:1.5s]" />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto animate-in fade-in-50 duration-1000 delay-600">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="p-2 bg-white/20 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Study Materials</h3>
                  <p className="text-sm text-blue-100">Buy & sell books, notes</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:bg-white/20 [animation-delay:0.2s]">
                <div className="p-2 bg-white/20 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Student Community</h3>
                  <p className="text-sm text-blue-100">Connect with JU students</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 transform hover:scale-105 transition-all duration-300 hover:bg-white/20 [animation-delay:0.4s]">
                <div className="p-2 bg-white/20 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Marketplace</h3>
                  <p className="text-sm text-blue-100">Everything you need</p>
                </div>
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="mt-12 animate-in slide-in-from-bottom-3 duration-1000 delay-800">
              <p className="text-lg text-blue-100 mb-2">
                "Jugaad" meets Technology
              </p>
              <p className="text-sm text-blue-200 max-w-sm mx-auto">
                The smartest way for Jadavpur University students to buy, sell, and connect with each other.
              </p>
            </div>

            {/* Animated university badge */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 animate-pulse">
              <GraduationCap className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium text-white">Jadavpur University</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}