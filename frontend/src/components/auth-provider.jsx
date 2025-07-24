"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { loginUser, registerUser, logoutUser, getCurrentUser } from "@/utils/api"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token")
    const userId = localStorage.getItem("user_id")

    if (token && userId) {
      // Fetch user data
      getCurrentUser()
        .then((data) => {
          console.log("✅ User loaded from token:", data)
          setUser(data)
        })
        .catch((err) => {
          console.error("❌ Error fetching user:", err)
          localStorage.removeItem("auth_token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("user_id")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (bac) => {
    try {
      setLoading(true)
      console.log("🔍 AuthProvider login attempt")

      const userData = await loginUser(bac)
      console.log("✅ Login successful in AuthProvider:", userData)

      setUser(userData)
      return true
    } catch (error) {
      console.error("❌ Login error in AuthProvider:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      console.log("🔍 AuthProvider register called with:", userData)

      const newUser = await registerUser(userData)
      console.log("✅ Registration successful in AuthProvider:", newUser)

      setUser(newUser)
      return true
    } catch (error) {
      console.error("❌ Registration error in AuthProvider:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log("🔍 Logging out user")
    logoutUser()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
