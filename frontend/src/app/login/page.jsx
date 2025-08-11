"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Mail, Lock, Sparkles, Zap, Star, ArrowRight } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")

  const { login } = useAuth()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔍 Login form submission:", formData)

      const success = await login(formData)

      if (success) {
        console.log("✅ Login successful, redirecting...")
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        })
        router.push("/marketplace")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      console.error("❌ Login form error:", err)
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white relative">
        {/* Subtle animated background for form side */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-32 right-20 w-24 h-24 bg-purple-100/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-lg">Sign in to continue your journey</p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 border border-gray-200/50 shadow-xl shadow-blue-500/5">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Sign In
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 animate-in slide-in-from-top-2">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-5 w-5 transition-all duration-300 ${
                        focusedField === 'email' ? 'text-blue-500 scale-110' : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      required
                      disabled={isLoading}
                      className={`pl-10 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 transform ${
                        focusedField === 'email' ? 'shadow-lg shadow-blue-500/10 -translate-y-0.5' : 'hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 transition-all duration-300 ${
                        focusedField === 'password' ? 'text-blue-500 scale-110' : 'text-gray-400'
                      }`} />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      required
                      disabled={isLoading}
                      className={`pl-10 pr-12 h-12 bg-white/90 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 transform ${
                        focusedField === 'password' ? 'shadow-lg shadow-blue-500/10 -translate-y-0.5' : 'hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-300 hover:scale-110"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-blue-600 hover:text-purple-600 font-medium transition-all duration-300 hover:underline hover:scale-105"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 group" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing you in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Sign In</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to JUgaadu?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <span className="text-gray-600 text-sm">Don't have an account? </span>
                <Link 
                  href="/signup" 
                  className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 inline-block"
                >
                  Create Account
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>🔒 Secure login protected by enterprise-grade encryption</p>
          </div>
        </div>
      </div>

      {/* Right Side - JUgaadu Branding */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Floating Stars */}
          <div className="absolute top-32 left-1/3 animate-bounce delay-300">
            <Star className="h-6 w-6 text-white/30" />
          </div>
          <div className="absolute top-1/2 right-1/4 animate-bounce delay-700">
            <Sparkles className="h-8 w-8 text-white/40" />
          </div>
          <div className="absolute bottom-1/3 left-1/2 animate-bounce delay-1000">
            <Zap className="h-7 w-7 text-white/35" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-12 text-center">
          {/* Logo */}
          <div className="mb-8 animate-in zoom-in duration-700">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl hover:scale-110 transition-transform duration-500 group">
              <Sparkles className="h-12 w-12 text-white group-hover:rotate-12 transition-transform duration-500" />
            </div>
          </div>

          {/* Brand Name */}
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-200">
            <h1 className="text-7xl font-bold text-white mb-4 tracking-tight">
              JU
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                gaadu
              </span>
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-white to-transparent rounded-full mx-auto mb-6 animate-pulse"></div>
          </div>

          {/* Tagline */}
          <div className="mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-400">
            <p className="text-xl text-white/90 font-light mb-4 max-w-md leading-relaxed">
              Your gateway to innovative solutions and seamless experiences
            </p>
            <p className="text-lg text-white/70 font-medium">
              ✨ Smart • Fast • Reliable ✨
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 gap-6 max-w-sm animate-in slide-in-from-bottom-4 duration-700 delay-600">
            <div className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Lightning-fast performance</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
              <span className="text-sm font-medium">Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80 hover:text-white transition-colors duration-300 hover:scale-105 transform">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-600"></div>
              <span className="text-sm font-medium">Innovative solutions</span>
            </div>
          </div>

          {/* Bottom Decoration */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
          </div>
        </div>

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-blue-900/20 animate-pulse"></div>
      </div>
    </div>
  )
}