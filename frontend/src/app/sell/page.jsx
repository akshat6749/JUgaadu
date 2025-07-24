"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, IndianRupee, Tag, BookOpen, Smartphone, FileText, Sofa, Camera, Sparkles, CheckCircle2, Wand2 } from "lucide-react"
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
    { value: "books", label: "Textbooks", icon: BookOpen, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { value: "electronics", label: "Electronics", icon: Smartphone, color: "bg-purple-50 text-purple-600 border-purple-200" },
    { value: "notes", label: "Study Notes", icon: FileText, color: "bg-green-50 text-green-600 border-green-200" },
    { value: "furniture", label: "Furniture", icon: Sofa, color: "bg-orange-50 text-orange-600 border-orange-200" },
  ]

  const conditions = [
    { value: "new", label: "New", desc: "Never used, in original packaging", color: "text-emerald-600" },
    { value: "like-new", label: "Like New", desc: "Barely used, excellent condition", color: "text-blue-600" },
    { value: "good", label: "Good", desc: "Some signs of wear but fully functional", color: "text-amber-600" },
    { value: "fair", label: "Fair", desc: "Well-used but still works properly", color: "text-red-600" },
  ]

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images.",
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
      const newTag = e.target.value.trim().toLowerCase()
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
      toast({
        title: "Title Required",
        description: "Please enter a title first to generate a description.",
        variant: "destructive",
      })
      return
    }

    setGeneratingDescription(true)
    try {
      // Prepare the request data
      const requestData = {
        title: formData.title.trim(),
        category: formData.category || '',
        condition: formData.condition || '',
        brand: formData.brand || '',
        tags: formData.tags.length > 0 ? formData.tags.join(', ') : ''
      }

      console.log("🤖 Generating description with data:", requestData)

      // Call the API function
      const generatedDescription = await generateDescriptionAPI(requestData)
      
      // Update the form data with generated description
      setFormData((prev) => ({
        ...prev,
        description: generatedDescription,
      }))

      toast({
        title: "Description Generated! ✨",
        description: "AI has generated a description for your item. You can edit it if needed.",
      })

    } catch (error) {
      console.error("❌ Error generating description:", error)
      
      // More detailed error handling
      let errorMessage = "Failed to generate description. Please try again."
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })

      // Fallback: Generate a simple description based on available data
      if (formData.title) {
        const fallbackDescription = generateFallbackDescription()
        setFormData((prev) => ({
          ...prev,
          description: fallbackDescription,
        }))
        
        toast({
          title: "Fallback Description Added",
          description: "Added a basic description. You can customize it further.",
          variant: "default",
        })
      }
    } finally {
      setGeneratingDescription(false)
    }
  }

  // Fallback description generator
  const generateFallbackDescription = () => {
    const { title, category, condition, brand, tags } = formData
    
    let description = `${title} for sale. `
    
    if (condition) {
      const conditionText = conditions.find(c => c.value === condition)?.label || condition
      description += `Condition: ${conditionText}. `
    }
    
    if (brand) {
      description += `Brand: ${brand}. `
    }
    
    if (category) {
      const categoryText = categories.find(c => c.value === category)?.label || category
      description += `Category: ${categoryText}. `
    }
    
    if (tags.length > 0) {
      description += `Tags: ${tags.join(', ')}. `
    }
    
    description += "Please contact me if you're interested!"
    
    return description
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list items.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your item.",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your item.",
        variant: "destructive",
      })
      return
    }

    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      toast({
        title: "Valid Price Required",
        description: "Please enter a valid price greater than 0.",
        variant: "destructive",
      })
      return
    }

    if (!formData.category) {
      toast({
        title: "Category Required",
        description: "Please select a category for your item.",
        variant: "destructive",
      })
      return
    }

    if (!formData.condition) {
      toast({
        title: "Condition Required",
        description: "Please select the condition of your item.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      console.log("🔍 Preparing product data for submission")

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
        location: "", // Add default location or get from user
      }

      console.log("📤 Product data to be sent:", productData)

      const result = await createProduct(productData)

      console.log("✅ Product created successfully:", result)

      toast({
        title: "Product listed successfully! 🎉",
        description: "Your item is now live on the marketplace.",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        originalPrice: "",
        category: "",
        condition: "",
        brand: "",
        tags: [],
      })
      setImages([])

      // Redirect to my listings
      router.push("/my-listings")
    } catch (error) {
      console.error("❌ Error creating product:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to list your product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Login Required
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                You need to be logged in to sell items on Campus Market.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => router.push("/login")} 
                className="mr-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/signup")}
                className="border-2 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transform hover:scale-105 transition-all duration-200"
              >
                Sign Up
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            Sell Your Item
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            List your textbooks, gadgets, or study materials for fellow students and turn your unused items into cash
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    Basic Information
                  </CardTitle>
                  <CardDescription className="text-base">Tell us about your item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="group">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Calculus Textbook 8th Edition"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="h-12 border-2 focus:border-indigo-500 focus:ring-indigo-200 transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="group">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                        Description *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateDescription}
                        disabled={generatingDescription || !formData.title.trim()}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100 text-purple-700 hover:text-purple-800 transition-all duration-200"
                      >
                        {generatingDescription ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                            Generating...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate with AI
                          </div>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="Describe the condition, any included accessories, and why you're selling..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="border-2 focus:border-indigo-500 focus:ring-indigo-200 transition-all duration-200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Fill in category, condition, and tags first for a better AI-generated description
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                        required
                      >
                        <SelectTrigger className="h-12 border-2 focus:border-indigo-500">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center py-2">
                                <div className={`p-2 rounded-lg mr-3 ${category.color}`}>
                                  <category.icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="group">
                      <Label htmlFor="condition" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Condition *
                      </Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                        required
                      >
                        <SelectTrigger className="h-12 border-2 focus:border-indigo-500">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              <div className="py-1">
                                <div className={`font-medium ${condition.color}`}>
                                  {condition.label}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {condition.desc}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="group">
                    <Label htmlFor="brand" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Brand (Optional)
                    </Label>
                    <Input
                      id="brand"
                      placeholder="e.g., Apple, Samsung, Pearson"
                      value={formData.brand}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      className="h-12 border-2 focus:border-indigo-500 focus:ring-indigo-200 transition-all duration-200"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                    </div>
                    Pricing
                  </CardTitle>
                  <CardDescription className="text-base">Set your price competitively</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <Label htmlFor="price" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Selling Price *
                      </Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="pl-12 h-12 border-2 focus:border-green-500 focus:ring-green-200 transition-all duration-200"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <Label htmlFor="originalPrice" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Original Price (Optional)
                      </Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-12 h-12 border-2 focus:border-indigo-500 focus:ring-indigo-200 transition-all duration-200"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  {formData.originalPrice && formData.price && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-700 font-medium">
                          You're saving buyers {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%!
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Tag className="h-4 w-4 text-purple-600" />
                    </div>
                    Tags
                  </CardTitle>
                  <CardDescription className="text-base">
                    Add tags to help buyers find your item (press Enter to add)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <Input 
                    placeholder="e.g., calculus, engineering, math" 
                    onKeyDown={handleTagInput}
                    className="h-12 border-2 focus:border-purple-500 focus:ring-purple-200 transition-all duration-200"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="cursor-pointer bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 hover:from-purple-200 hover:to-pink-200 transition-all duration-200 px-3 py-1" 
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 ml-2" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Image Upload */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                      <Camera className="h-4 w-4 text-cyan-600" />
                    </div>
                    Photos
                  </CardTitle>
                  <CardDescription className="text-base">Add up to 5 photos of your item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-400 hover:bg-cyan-50/50 transition-all duration-300 group cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-base font-medium text-gray-700 group-hover:text-cyan-600 transition-colors">
                        Click to upload photos
                      </p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt="Product"
                            className="w-full h-24 object-cover rounded-xl border-2 border-gray-200 group-hover:border-cyan-300 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Listing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Sparkles className="h-5 w-5 mr-2" />
                          List Item
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}