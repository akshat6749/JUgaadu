"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, GraduationCap, Phone, User, Lock, Loader2, Zap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) return setError("NAME REQUIRED") || false
    if (!formData.email.trim()) return setError("EMAIL REQUIRED") || false
    if (!/^[^\s@]+@jadavpuruniversity\.in$/i.test(formData.email)) return setError("ONLY @JADAVPURUNIVERSITY.IN ACCEPTED.") || false
    if (!formData.password) return setError("PASSWORD REQUIRED") || false
    if (formData.password.length < 6) return setError("PASSWORD 6+ CHARS") || false
    if (formData.password !== formData.confirmPassword) return setError("PASSWORDS MISMATCH") || false
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!validateForm()) return
    setIsLoading(true)
    try {
      await register(formData)
      toast({ title: "ACCOUNT CREATED", description: "WELCOME TO JUGAADU DIRECTIVE." })
      setTimeout(() => { router.push("/marketplace") }, 1000)
    } catch (err) {
      setError(err.message || "REGISTRATION FAILED.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-[#121212] selection:bg-[#CCFF00] selection:text-black font-jakarta overflow-hidden">
      {/* LEFT: FORM SECTION */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto p-6 relative bg-white border-r-[8px] border-black flex flex-col items-center">

        <div className="w-full max-w-sm m-auto relative z-10 py-8 shrink-0">
          <div className="mb-4 text-left mt-4 lg:mt-0">
            <Link href="/" className="inline-block border-[2px] border-black bg-[#CCFF00] px-3 py-1 font-mono font-bold text-[10px] uppercase hover:shadow-[3px_3px_0px_#000] -translate-y-0.5 transition-all mb-2">
              ← BASE
            </Link>
            <h1 className="font-ranchers text-5xl text-black uppercase leading-none tracking-wide">
              SIGN UP
            </h1>
            <p className="font-mono text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2 border-l-[4px] border-[#CCFF00] pl-3">
              ESTABLISH IDENTITY STATUS
            </p>
          </div>

          <div className="bg-white border-[4px] border-black neo-shadow-black p-5 relative mt-6">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 bg-black text-[#CCFF00] border-[2px] border-[#CCFF00] p-2 text-center sticker-rotate-2 shadow-[4px_4px_0_0_#000] z-20">
              <p className="font-mono text-[8px] font-black tracking-widest leading-[1.2] uppercase">
                REQUIREMENT: <br /><span className="text-white underline decoration-[#CCFF00]">@JADAVPURUNIVERSITY.IN</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative mt-6">
              {error && (
                <div className="bg-red-500 border-[3px] border-black py-2 px-3 text-white font-mono font-bold uppercase text-[10px] flex items-center gap-2 sticker-rotate-1">
                  <Zap className="h-4 w-4 shrink-0" /> <span>{error}</span>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-black uppercase">FULL NAME</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-black" /></div>
                  <input name="name" type="text" placeholder="ENTER DESIGNATION" value={formData.name} onChange={handleChange} required disabled={isLoading} className="w-full pl-9 pr-2 py-2.5 bg-white border-[3px] border-black text-black placeholder:text-gray-500 text-xs font-mono font-bold focus:bg-[#CCFF00] shadow-[3px_3px_0_0_#e5e7eb] focus:shadow-[3px_3px_0_0_#000] focus:-translate-y-1 uppercase transition-all" />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-black uppercase">COLLEGE EMAIL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><GraduationCap className="h-4 w-4 text-black" /></div>
                    <input name="email" type="email" placeholder="ID@JU.IN" value={formData.email} onChange={handleChange} required disabled={isLoading} className="w-full pl-9 pr-2 py-2.5 bg-white border-[3px] border-black text-black placeholder:text-gray-500 text-xs font-mono font-bold focus:bg-[#CCFF00] shadow-[3px_3px_0_0_#e5e7eb] focus:shadow-[3px_3px_0_0_#000] focus:-translate-y-1 uppercase transition-all" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-black uppercase">COMM LINK</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-black" /></div>
                    <input name="phone" type="tel" placeholder="PHONE NO." value={formData.phone} onChange={handleChange} disabled={isLoading} className="w-full pl-9 pr-2 py-2.5 bg-white border-[3px] border-black text-black placeholder:text-gray-500 text-xs font-mono font-bold focus:bg-[#CCFF00] shadow-[3px_3px_0_0_#e5e7eb] focus:shadow-[3px_3px_0_0_#000] focus:-translate-y-1 uppercase transition-all" />
                  </div>
                </div>
              </div>

              {/* Passwords Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-black uppercase">CIPHER</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-black" /></div>
                    <input name="password" type={showPassword ? "text" : "password"} placeholder="INPUT" value={formData.password} onChange={handleChange} required disabled={isLoading} className="w-full pl-9 pr-8 py-2.5 bg-white border-[3px] border-black text-black placeholder:text-gray-500 text-xs font-mono font-bold focus:bg-[#CCFF00] shadow-[3px_3px_0_0_#e5e7eb] focus:shadow-[3px_3px_0_0_#000] focus:-translate-y-1 uppercase transition-all" />
                    <button type="button" className="absolute right-0 top-0 h-full px-2 hover:bg-black hover:text-[#CCFF00] border-l-[3px] border-transparent hover:border-black transition-colors" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-black uppercase">VERIFY</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-black" /></div>
                    <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="RE-TYPE" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} className="w-full pl-9 pr-8 py-2.5 bg-white border-[3px] border-black text-black placeholder:text-gray-500 text-xs font-mono font-bold focus:bg-[#CCFF00] shadow-[3px_3px_0_0_#e5e7eb] focus:shadow-[3px_3px_0_0_#000] focus:-translate-y-1 uppercase transition-all" />
                    <button type="button" className="absolute right-0 top-0 h-full px-2 hover:bg-black hover:text-[#CCFF00] border-l-[3px] border-transparent hover:border-black transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-[#CCFF00] text-black border-[4px] border-black py-3 mt-4 font-mono font-extrabold uppercase text-[12px] shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-black hover:text-[#CCFF00] flex justify-center items-center transition-all">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> WRITING...</> : "ESTABLISH ACCOUNT"}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t-[3px] border-black text-center">
              <span className="font-mono font-bold text-[10px] text-black uppercase">ALREADY LISTED? </span>
              <Link href="/login" className="font-mono font-bold text-[10px] text-white bg-black px-2 py-1 hover:bg-[#CCFF00] hover:text-black border-[2px] border-transparent hover:border-black transition-colors ml-1 uppercase">PROCEED TO LOGIN</Link>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#121212] flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "linear-gradient(#CCFF00 2px, transparent 2px), linear-gradient(90deg, #CCFF00 2px, transparent 2px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-[#CCFF00] border-[4px] border-black flex items-center justify-center neo-shadow-vault sticker-rotate-2 mb-8 hover:-rotate-12 transition-transform shadow-[4px_4px_0_0_#FFF]">
            <GraduationCap className="h-12 w-12 text-black" />
          </div>
          <h2 className="font-ranchers text-[90px] leading-[0.8] text-white uppercase drop-shadow-[5px_5px_0_#CCFF00] mb-4">THE<br />NETWORK<br /><span className="text-[#CCFF00] drop-shadow-[5px_5px_0_#FFF]">AWAITS</span></h2>
          <div className="bg-white text-black font-mono font-bold text-xs px-4 py-2 border-[4px] border-[#CCFF00] shadow-[5px_5px_0_0_#000]">EXCLUSIVE. NO OUTSIDERS.</div>
        </div>
      </div>
    </div>
  )
}