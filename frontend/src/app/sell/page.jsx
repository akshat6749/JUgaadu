"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Upload, X, Tag, Zap, Camera, Lock, ArrowRight, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { createProduct, generateDescriptionAPI } from "@/utils/api"

export default function SellPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [images, setImages] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    condition: "",
    brand: "",
    tags: [],
  })

  const categories = [
    { value: "books", label: "TEXTBOOKS" },
    { value: "electronics", label: "ELECTRONICS" },
    { value: "notes", label: "STUDY NOTES" },
    { value: "furniture", label: "FURNITURE" },
  ]

  const conditions = [
    { value: "new", label: "NEW DEPLOYMENT" },
    { value: "like-new", label: "MINIMAL WEAR" },
    { value: "good", label: "FIELD TESTED" },
    { value: "fair", label: "HEAVILY USED" },
  ]

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) {
      toast({
        title: "OVERLOAD",
        description: "MAX 5 IMAGES PERMITTED.",
        variant: "destructive",
      })
      return
    }

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages((prev) => [...prev, { file, url: e.target.result, id: Date.now() + Math.random() }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault()
      const newTag = e.target.value.trim().toUpperCase()
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }))
      }
      e.target.value = ""
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      toast({ title: "INVALID SYNTAX", description: "REQUIRE TITLE FOR AI GEN.", variant: "destructive" })
      return
    }

    setGeneratingDescription(true)
    try {
      const requestData = {
        title: formData.title.trim(),
        category: formData.category || '',
        condition: formData.condition || '',
        brand: formData.brand || '',
        tags: formData.tags.length > 0 ? formData.tags.join(', ') : ''
      }

      const generatedDescription = await generateDescriptionAPI(requestData)

      setFormData((prev) => ({ ...prev, description: generatedDescription }))
      toast({ title: "AI DEPLOYED", description: "DATA POPULATED." })
    } catch (error) {
      if (formData.title) {
        setFormData((prev) => ({
          ...prev,
          description: `ASSET: ${formData.title.toUpperCase()}\nCONDITION: ${formData.condition.toUpperCase()}\nCATEGORY: ${formData.category.toUpperCase()}\n\nCONTACT FOR DETAILS.`,
        }))
        toast({ title: "FALLBACK ENGAGED", description: "BASIC TEMPLATE APPLIED." })
      }
    } finally {
      setGeneratingDescription(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.category || !formData.condition) {
      toast({ title: "SYNTAX ERROR", description: "FILL ALL REQUIRED FIELDS.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        original_price: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
        category: formData.category,
        condition: formData.condition,
        brand: formData.brand.trim() || null,
        tags: formData.tags,
        images: images,
        location: "JADAVPUR HQ",
      }

      await createProduct(productData)

      toast({ title: "REGISTRY UPDATED", description: "ASSET DEPLOYED TO MARKET." })
      setFormData({ title: "", description: "", price: "", originalPrice: "", category: "", condition: "", brand: "", tags: [] })
      setImages([])
      router.push("/my-listings")
    } catch (error) {
      toast({ title: "FAILURE", description: "DEPLOYMENT REJECTED.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="bg-[#CCFF00] border-[8px] border-black p-12 neo-shadow-vault flex flex-col items-center max-w-lg mx-auto transform -rotate-2">
            <Lock className="h-20 w-20 text-black mb-6" />
            <h2 className="font-ranchers text-5xl text-black uppercase mb-4">ACCESS DENIED</h2>
            <div className="bg-black text-[#CCFF00] font-mono font-bold text-sm uppercase px-4 py-2 mb-8 border-[4px] border-black">
              AUTH PROTOCOL REQUIRED TO DEPLOY SELLING MODULE.
            </div>
            <button onClick={() => router.push("/login")} className="w-full bg-white text-black border-[4px] border-black py-4 font-mono font-bold text-xl uppercase neo-shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center">
              LOGIN SEQUENCE <ArrowRight className="ml-2 h-6 w-6" />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] font-jakarta selection:bg-[#CCFF00] selection:text-black">
      <Header />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-10 text-left">
          <div className="inline-flex bg-[#CCFF00] border-[3px] border-black px-2 py-1 font-mono font-bold uppercase text-[10px] mb-4 sticker-rotate-1">
            <Zap className="h-3 w-3 mr-1" /> DATA ENTRY MODULE
          </div>
          <h1 className="font-ranchers text-6xl md:text-8xl text-white uppercase drop-shadow-[5px_5px_0_#CCFF00]">
            DEPLOY ASSET
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col lg:flex-row gap-8 lg:space-y-0">

          <div className="flex-1 space-y-8">
            {/* Core Info */}
            <div className="bg-white border-[6px] border-black p-6 md:p-8 neo-shadow-vault">
              <h2 className="font-ranchers text-4xl text-black uppercase mb-6 border-b-[4px] border-black pb-2 flex items-center">
                <Tag className="mr-3 h-8 w-8 text-black" /> IDENTIFICATION
              </h2>

              <div className="space-y-6 form-group">
                <div className="flex flex-col">
                  <label className="font-mono text-sm font-bold text-black uppercase mb-2">ASSET TITLE *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="E.G. ENGINEERING MATH 101"
                    className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold uppercase text-black placeholder:text-gray-400 focus:outline-none focus:bg-[#CCFF00] transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between items-end mb-2">
                    <label className="font-mono text-sm font-bold text-black uppercase">DATA LOG (DESCRIPTION) *</label>
                    <button type="button" onClick={handleGenerateDescription} disabled={generatingDescription} className="bg-black text-[#CCFF00] border-[2px] border-black px-2 py-1 font-mono font-bold text-[10px] uppercase hover:bg-[#CCFF00] hover:text-black transition-colors flex items-center">
                      {generatingDescription ? "GENERATING..." : <><Zap className="h-3 w-3 mr-1" /> AI ATTACH</>}
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="INPUT PARAMETERS: CONDITION, CONTENT, KNOWN ISSUES..."
                    className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold text-sm text-black placeholder:text-gray-400 focus:outline-none focus:bg-[#CCFF00] transition-colors resize-none uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-mono text-sm font-bold text-black uppercase mb-2">CATEGORY CLASSIFICATION *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold uppercase text-black appearance-none focus:outline-none focus:bg-[#CCFF00] transition-colors cursor-pointer"
                      required
                    >
                      <option value="" disabled>SELECT LOGIC MODULE</option>
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="font-mono text-sm font-bold text-black uppercase mb-2">STRUCTURAL INTEGRITY *</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold uppercase text-black appearance-none focus:outline-none focus:bg-[#CCFF00] transition-colors cursor-pointer"
                      required
                    >
                      <option value="" disabled>SELECT STATE</option>
                      {conditions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-mono text-sm font-bold text-black uppercase mb-2">EXCHANGE VALUE (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="00.00"
                      className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold text-xl uppercase text-black placeholder:text-gray-400 focus:outline-none focus:bg-[#CCFF00] transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-mono text-sm font-bold text-black uppercase mb-2">ORIGINAL MSRP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                      placeholder="OPTIONAL"
                      className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold text-xl uppercase text-black placeholder:text-gray-400 focus:outline-none focus:bg-pink-300 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-mono text-sm font-bold text-black uppercase mb-2">IDENTIFIER TAGS (ENTER)</label>
                  <input
                    type="text"
                    onKeyDown={handleTagInput}
                    placeholder="PRESS ENTER TO APPEND TAG"
                    className="w-full bg-gray-50 border-[4px] border-black px-4 py-3 font-mono font-bold uppercase text-black placeholder:text-gray-400 focus:outline-none focus:bg-cyan-300 transition-colors"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.tags.map(tag => (
                        <div key={tag} onClick={() => removeTag(tag)} className="bg-black text-white px-3 py-1 font-mono font-bold text-xs flex items-center cursor-pointer hover:bg-red-500 hover:text-white transition-colors">
                          {tag} <X className="ml-2 h-3 w-3" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className="w-full lg:w-4/12 flex flex-col space-y-8">
            {/* Media Uploads */}
            <div className="bg-[#CCFF00] border-[6px] border-black p-6 md:p-8 neo-shadow-vault">
              <h2 className="font-ranchers text-3xl text-black uppercase mb-6 border-b-[4px] border-black pb-2 flex items-center">
                <Camera className="mr-3 h-6 w-6 text-black" /> VISUALS
              </h2>

              <div className="border-[4px] border-black border-dashed bg-white p-8 text-center cursor-pointer hover:bg-yellow-100 transition-colors relative group overflow-hidden mb-6">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <Upload className="mx-auto h-12 w-12 text-black mb-4 group-hover:-translate-y-2 transition-transform" />
                <p className="font-mono font-bold text-sm text-black uppercase">DROP FILES DOMAIN</p>
                <p className="font-mono text-[10px] text-gray-500 uppercase mt-2">NO MORE THAN 5 COMMS</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {images.map(img => (
                    <div key={img.id} className="relative aspect-square border-[4px] border-black bg-black group overflow-hidden">
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 opacity-80 group-hover:opacity-100 transition-all" alt="upload" />
                      <button type="button" onClick={() => removeImage(img.id)} className="absolute top-0 right-0 bg-red-500 text-white p-1 border-l-[4px] border-b-[4px] border-black hover:bg-white hover:text-black">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-20 bg-white border-[6px] border-black neo-shadow-vault font-ranchers text-4xl uppercase text-black hover:bg-black hover:text-[#CCFF00] hover:-translate-y-2 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "TRANSMITTING..." : "PUBLISH ASSET"}
            </button>
          </div>
        </form>

      </div>
      <Footer />
    </div>
  )
}