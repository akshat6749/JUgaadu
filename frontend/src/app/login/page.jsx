"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, Loader2, Zap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(formData)
      if (success) {
        toast({ title: "ACCESS GRANTED", description: "WELCOME BACK TO THE ENGINE." })
        router.push("/marketplace")
      } else {
        setError("INVALID CREDENTIALS")
      }
    } catch (err) {
      setError(err.message || "LOGIN PROTOCOL FAILED.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-[#121212] selection:bg-[#CCFF00] selection:text-black font-jakarta overflow-hidden">
      {/* LEFT: FORM SECTION */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 lg:p-12 relative bg-white border-r-[8px] border-black flex flex-col">

        <div className="w-full max-w-sm m-auto relative z-10 py-8 shrink-0">
          <div className="mb-6 text-left">
            <Link href="/" className="inline-block border-[2px] border-black bg-[#CCFF00] px-3 py-1 font-mono font-bold text-[10px] uppercase hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all mb-4">
              ← RETURN BASE
            </Link>
            <h1 className="font-ranchers text-6xl text-black uppercase leading-none tracking-wide">
              SIGN IN
            </h1>
            <p className="font-mono text-gray-500 font-bold uppercase text-xs tracking-widest mt-2 border-l-[4px] border-[#CCFF00] pl-3">
              ACCESS MARKET ENGINE
            </p>
          </div>

          <div className="bg-white border-[4px] border-black neo-shadow-black p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500 border-[3px] border-black py-2 px-3 text-white font-mono font-bold uppercase text-[10px] flex items-center gap-2 sticker-rotate-1">
                  <Zap className="h-4 w-4 fill-current shrink-0" /> {error}
                </div>
              )}

              <div className="bg-black text-[#CCFF00] border-[3px] border-[#CCFF00] p-3 text-center mb-4">
                <p className="font-mono text-[9px] font-extrabold tracking-widest leading-relaxed uppercase">
                  RESTRICTION: JADAVPUR UNIVERSITY ONLY.<br /> USE <span className="text-white underline decoration-[#CCFF00]">@JADAVPURUNIVERSITY.IN</span>
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="font-mono text-xs font-bold text-black uppercase">EMAIL ADDRESS</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-black" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ENTER .EDU EMAIL"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-3 py-3 bg-white border-[3px] border-black text-black placeholder:text-gray-500 font-mono font-bold text-xs outline-none focus:bg-[#CCFF00] uppercase shadow-[4px_4px_0_0_#e5e7eb] focus:shadow-[4px_4px_0_0_#000] focus:-translate-y-1 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="font-mono text-xs font-bold text-black uppercase">PASSWORD</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-black" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="ENTER CIPHER"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-3 bg-white border-[3px] border-black text-black placeholder:text-gray-500 font-mono font-bold text-xs outline-none focus:bg-[#CCFF00] uppercase shadow-[4px_4px_0_0_#e5e7eb] focus:shadow-[4px_4px_0_0_#000] focus:-translate-y-1 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 text-black hover:bg-black hover:text-[#CCFF00] border-l-[3px] border-transparent hover:border-black transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="font-mono text-[10px] font-bold text-gray-500 hover:text-black uppercase underline decoration-[#CCFF00]">LOST CIPHER?</Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#CCFF00] text-black border-[4px] border-black py-4 mt-2 font-mono font-extrabold uppercase text-sm shadow-[4px_4px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-black hover:text-[#CCFF00] transition-all flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> AUTH...</> : "INITIALIZE LOGIN"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t-[3px] border-black text-center">
              <span className="font-mono font-bold text-[10px] text-black uppercase">NO CLEARANCE? </span>
              <Link href="/signup" className="font-mono font-bold text-[10px] text-white bg-black px-2 py-1 uppercase hover:bg-[#CCFF00] hover:text-black border-[2px] border-transparent hover:border-black ml-1 transition-colors">CREATE ACCOUNT</Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#CCFF00] flex-col justify-center items-center relative">
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "30px 30px" }} />
        <div className="relative z-10 text-center flex flex-col items-center p-8">
          <div className="w-24 h-24 bg-black border-[4px] border-white flex items-center justify-center neo-shadow-black sticker-rotate-2 mb-8 hover:rotate-12 transition-transform">
            <div className="text-white font-ranchers text-4xl">JU</div>
          </div>
          <h2 className="font-ranchers text-[90px] leading-[0.8] text-black uppercase drop-shadow-[5px_5px_0px_#fff] mb-4">CAMPUS<br />JUG<span className="text-white drop-shadow-[5px_5px_0px_#000]">AADU</span></h2>
        </div>
      </div>
    </div>
  )
}