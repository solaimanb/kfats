"use client"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useUpdateProduct } from "@/lib/hooks/useProducts"
import { ProductsAPI } from "@/lib/api/products"
import { type ProductCreate, ProductCategory, Product } from "@/lib/types/api"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Package, DollarSign, ImageIcon, Warehouse, Plus, X, Eye, AlertCircle, Loader2 } from "lucide-react"
import Image from "next/image"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  price: z.number().min(0.01, "Price must be greater than 0").max(999999, "Price too high"),
  category: z.nativeEnum(ProductCategory),
  image_urls: z.array(z.string().url("Invalid URL")),
  stock_quantity: z.number().min(0, "Stock cannot be negative").int("Stock must be a whole number"),
})

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = Number(params.id)
  const updateMutation = useUpdateProduct()
  const [imageUrls, setImageUrls] = useState<string[]>([""])
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const form = useForm<ProductCreate>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: ProductCategory.OTHER,
      image_urls: [],
      stock_quantity: 0,
    },
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await ProductsAPI.getProductById(productId)
        setProduct(productData)
        setImageUrls(productData.image_urls && productData.image_urls.length > 0 ? productData.image_urls : [""])

        form.reset({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image_urls: productData.image_urls || [],
          stock_quantity: productData.stock_quantity,
        })
      } catch {
        setIsError(true)
        toast.error("Failed to load product")
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, form])

  const onSubmit = async (values: ProductCreate) => {
    try {
      const validUrls = imageUrls.filter((url) => url.trim() !== "")
      const submitData = { ...values, image_urls: validUrls }
      await updateMutation.mutateAsync({ productId, productData: submitData })
      toast.success("Product updated successfully!")
      router.push("/dashboard/seller/my-products")
    } catch {
      toast.error("Failed to update product")
    }
  }

  const addImageUrl = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, ""])
    }
  }

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index)
    setImageUrls(newUrls.length === 0 ? [""] : newUrls)
    form.setValue(
      "image_urls",
      newUrls.filter((url) => url.trim() !== ""),
    )
  }

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls]
    newUrls[index] = value
    setImageUrls(newUrls)
    form.setValue(
      "image_urls",
      newUrls.filter((url) => url.trim() !== ""),
    )
  }

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url)
      return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null
    } catch {
      return false
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading product...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-12">
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load product. Please try again or go back to your products list.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-6">
              <Button onClick={() => router.push("/dashboard/seller/my-products")}>
                Back to Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5" />
            Edit Product
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Basic Info
                  </Badge>
                </div>

                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name..." className="h-12 text-base" {...field} />
                        </FormControl>
                        <FormDescription>Choose a clear, descriptive name for your product</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product in detail..."
                            className="min-h-[120px] text-base resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description to help customers understand your product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Pricing & Category Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Pricing & Category
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Price (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="h-12 pl-10 text-base"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ProductCategory.PAINTING}>🎨 Painting</SelectItem>
                            <SelectItem value={ProductCategory.SCULPTURE}>🗿 Sculpture</SelectItem>
                            <SelectItem value={ProductCategory.DIGITAL_ART}>💻 Digital Art</SelectItem>
                            <SelectItem value={ProductCategory.PHOTOGRAPHY}>📸 Photography</SelectItem>
                            <SelectItem value={ProductCategory.CRAFTS}>✂️ Crafts</SelectItem>
                            <SelectItem value={ProductCategory.OTHER}>📦 Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Media & Inventory Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Media & Inventory
                  </Badge>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-base font-semibold">Product Images</label>
                        <p className="text-sm text-slate-600 mt-1">Add up to 5 high-quality images of your product</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {imageUrls.filter((url) => url.trim() !== "").length}/5
                      </Badge>
                    </div>

                    {/* Individual Image URL Inputs */}
                    <div className="space-y-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-1">
                            <div className="relative">
                              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <Input
                                placeholder={`Image URL ${index + 1}`}
                                value={url}
                                onChange={(e) => updateImageUrl(index, e.target.value)}
                                className="h-12 pl-10 text-base"
                              />
                              {url.trim() && !isValidImageUrl(url) && (
                                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                              )}
                            </div>
                            {url.trim() && !isValidImageUrl(url) && (
                              <p className="text-xs text-red-500 mt-1">Please enter a valid image URL</p>
                            )}
                          </div>

                          {url.trim() && isValidImageUrl(url) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(url, "_blank")}
                              className="h-12 px-3"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}

                          {imageUrls.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImageUrl(index)}
                              className="h-12 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add More Images Button */}
                    {imageUrls.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addImageUrl}
                        className="w-full h-12 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Image
                      </Button>
                    )}

                    {/* Image Previews */}
                    {imageUrls.some((url) => url.trim() && isValidImageUrl(url)) && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700">Image Previews</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {imageUrls
                            .filter((url) => url.trim() && isValidImageUrl(url))
                            .map((url, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
                                  <Image
                                    src={url || "/placeholder.svg"}
                                    alt={`Product image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    width={600}
                                    height={400}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = "none"
                                      const parent = target.parentElement
                                      if (parent) {
                                        parent.innerHTML = `
                                            <div class="w-full h-full flex items-center justify-center">
                                              <div class="text-center">
                                                <svg class="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <p class="text-xs text-slate-500">Failed to load</p>
                                              </div>
                                            </div>
                                          `
                                      }
                                    }}
                                  />
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => window.open(url, "_blank")}
                                    className="bg-white/90 hover:bg-white"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                                <div className="absolute -top-2 -right-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Stock Quantity</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Warehouse className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="h-12 pl-10 text-base"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>How many units do you have in stock?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {updateMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {"Failed to update product. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  type="button"
                  className="w-full sm:w-auto h-12 px-8"
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating Product...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}