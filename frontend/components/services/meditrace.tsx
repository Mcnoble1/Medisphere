"use client"

import React from "react"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Truck,
  QrCode,
  Shield,
  MapPin,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Factory,
  Building2,
  Plane,
  Home,
  Search,
  Camera,
  FileText,
  ExternalLink,
  Plus,
  Loader2,
  Download,
  X,
} from "lucide-react"

interface MediTraceProps {
  userRole?: string
}

interface Batch {
  _id: string
  productName: string
  batchNumber: string
  trackingNumber?: string
  quantity: number
  manufacturingDate?: string
  expiryDate?: string
  manufacturingFacility?: string
  tokenId?: string
  qrCode?: string
  isFlagged?: boolean
  flagReason?: string
  currentHolder?: string
  hcsMessageId?: string
  history?: Array<{
    action: string
    location: string
    timestamp: string
    notes: string
  }>
  createdAt: string
}

export default function MediTrace({ userRole = "patient" }: MediTraceProps) {
  const [activeTab, setActiveTab] = useState(userRole === "pharma" ? "register" : "track")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Batch | null>(null)
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [reportForm, setReportForm] = useState({
    productId: "",
    issueType: "",
    description: "",
    location: "",
  })

  const [newProductForm, setNewProductForm] = useState({
    productName: "",
    batchNumber: "",
    quantity: "1",
    manufacturer: "",
    manufacturingDate: "",
    expiryDate: "",
    currentLocation: "",
    temperature: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [showNewProductDialog, setShowNewProductDialog] = useState(false)
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null)
  const [showQRScannerDialog, setShowQRScannerDialog] = useState(false)
  const [isScannerActive, setIsScannerActive] = useState(false)

  // Load current user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await apiClient.getCurrentUser()
        setCurrentUser(user)
      } catch (err: any) {
        console.error("Error loading user:", err)
      }
    }
    loadUser()
  }, [])

  // Load batches on mount
  useEffect(() => {
    loadBatches()
  }, [userRole, currentUser])

  const loadBatches = async () => {
    // Only load batches if user is pharma
    if (userRole !== "pharma") {
      setBatches([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      // If pharma, only load their products
      const params: any = {}
      if (currentUser?.hederaAccountId) {
        params.manufacturerDid = currentUser.hederaAccountId
      }

      const response = await apiClient.getAllBatches(params)
      setBatches(response.batches || [])
    } catch (err: any) {
      console.error("Error loading batches:", err)
      setError(err.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleProductRegistration = async () => {
    if (!newProductForm.productName || !newProductForm.batchNumber || !newProductForm.manufacturer) {
      setError("Please fill in all required fields")
      return
    }

    setIsRegistering(true)
    setError(null)
    setSuccess(null)

    try {
      const manufacturerDid = currentUser?.hederaAccountId || `did:hedera:testnet:${currentUser?._id}`

      const response = await apiClient.createBatch({
        productName: newProductForm.productName,
        batchNumber: newProductForm.batchNumber,
        quantity: parseInt(newProductForm.quantity) || 1,
        manufacturingDate: newProductForm.manufacturingDate || undefined,
        expiryDate: newProductForm.expiryDate || undefined,
        manufacturingFacility: newProductForm.manufacturer,
        metadata: {
          currentLocation: newProductForm.currentLocation,
          temperature: newProductForm.temperature,
        },
        manufacturerDid,
      })

      setSuccess(response.message || "Product registered successfully! QR code generated.")

      // Show QR code
      if (response.batch?.qrCode) {
        setSelectedQRCode(response.batch.qrCode)
        setShowQRCodeDialog(true)
      }

      // Reset form and reload
      setNewProductForm({
        productName: "",
        batchNumber: "",
        quantity: "1",
        manufacturer: "",
        manufacturingDate: "",
        expiryDate: "",
        currentLocation: "",
        temperature: "",
      })
      setShowNewProductDialog(false)
      await loadBatches()
    } catch (err: any) {
      console.error("Error registering product:", err)
      setError(err.message || "Failed to register product")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleProductTrack = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a batch number to track")
      return
    }

    setIsTracking(true)
    setError(null)

    try {
      const response = await apiClient.getBatchByNumber(searchQuery.trim())
      if (response.batch) {
        setSelectedProduct(response.batch)
        setActiveTab("history")
      }
    } catch (err: any) {
      console.error("Error tracking product:", err)
      setError(err.message || "Product not found")
    } finally {
      setIsTracking(false)
    }
  }

  const handleReportSubmit = async () => {
    if (!reportForm.productId || !reportForm.issueType || !reportForm.description || !reportForm.location) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const reporterDid = currentUser?.hederaAccountId || `did:hedera:testnet:${currentUser?._id}`

      const response = await apiClient.reportBatchIssue({
        batchNumber: reportForm.productId,
        reporterDid,
        issueType: reportForm.issueType as any,
        description: reportForm.description,
        location: reportForm.location,
      })

      setSuccess(response.message || "Issue reported successfully! Government health service has been notified.")

      // Reset form
      setReportForm({
        productId: "",
        issueType: "",
        description: "",
        location: "",
      })

      // Reload batches
      await loadBatches()
    } catch (err: any) {
      console.error("Error reporting issue:", err)
      setError(err.message || "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillTestProductData = () => {
    setNewProductForm({
      productName: "Test Medication 500mg",
      batchNumber: `MED-TEST-${Date.now()}`,
      quantity: "100",
      manufacturer: "Test Pharma Corp",
      manufacturingDate: "2024-03-01",
      expiryDate: "2026-03-01",
      currentLocation: "Test Facility Lagos",
      temperature: "2-8°C",
    })
  }

  const fillTestReportData = () => {
    if (batches.length > 0) {
      setReportForm({
        productId: batches[0].batchNumber,
        issueType: "temperature",
        description: "Product was stored at room temperature instead of required 2-8°C for 3 hours during transport",
        location: "Lagos General Hospital Pharmacy",
      })
    }
  }

  const handleQRScan = async (decodedText: string) => {
    // Close scanner
    setShowQRScannerDialog(false)
    setIsScannerActive(false)

    // Extract batch number from URL or use as-is
    let batchNumber = decodedText
    try {
      // If it's a URL, extract the batch number from the path
      const url = new URL(decodedText)
      const pathParts = url.pathname.split('/')
      batchNumber = pathParts[pathParts.length - 1]
    } catch {
      // Not a URL, use as-is
    }

    // Set search query and track
    setSearchQuery(batchNumber)
    setIsTracking(true)
    setError(null)

    try {
      const response = await apiClient.getBatchByNumber(batchNumber)
      if (response.batch) {
        setSelectedProduct(response.batch)
        setActiveTab("verify")
      }
    } catch (err: any) {
      console.error("Error tracking product:", err)
      setError(err.message || "Product not found")
    } finally {
      setIsTracking(false)
    }
  }

  const handleOpenScanner = () => {
    setShowQRScannerDialog(true)
    setIsScannerActive(true)
  }

  // QR Scanner effect
  useEffect(() => {
    if (isScannerActive && showQRScannerDialog) {
      const loadScanner = async () => {
        const { Html5QrcodeScanner } = await import('html5-qrcode')

        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        )

        scanner.render(
          (decodedText) => {
            scanner.clear()
            handleQRScan(decodedText)
          },
          (error) => {
            // Ignore scan errors (they happen frequently during scanning)
          }
        )

        return () => {
          scanner.clear().catch(console.error)
        }
      }

      loadScanner()
    }
  }, [isScannerActive, showQRScannerDialog])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  // Filter batches based on search
  const filteredBatches = batches.filter((batch) =>
    batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.manufacturingFacility?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-xl">
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center">
            <Truck className="w-6 h-6 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">MediTrace™</h1>
        </div>
        <Badge variant="secondary" className="mb-4 bg-muted/20 text-muted-foreground border-muted/30 rounded-full">
          {userRole === "pharma" ? "Pharmaceutical Product Registration & Tracking" : "Supply Chain Tracking & Verification"}
        </Badge>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Blockchain-based tracking of medical devices and drugs for authenticity and safety
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${userRole === "pharma" ? "grid-cols-4" : "grid-cols-4"}`}>
          {userRole === "pharma" && (
            <TabsTrigger value="register">
              <Plus className="w-4 h-4 mr-2" />
              Register Product
            </TabsTrigger>
          )}
          <TabsTrigger value="track">Track Product</TabsTrigger>
          <TabsTrigger value="verify">Verify Authenticity</TabsTrigger>
          <TabsTrigger value="history">Supply Chain History</TabsTrigger>
          <TabsTrigger value="report">Report Issue</TabsTrigger>
        </TabsList>

        {/* Register Product Tab (Pharma Only) */}
        {userRole === "pharma" && (
          <TabsContent value="register" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Register New Pharmaceutical Product
                </CardTitle>
                <CardDescription>
                  Register a new product on the blockchain to enable tracking and authenticity verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={fillTestProductData} className="text-xs bg-transparent">
                    Fill Test Data
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product-name">Product Name *</Label>
                    <Input
                      id="product-name"
                      placeholder="Amoxicillin 500mg"
                      value={newProductForm.productName}
                      onChange={(e) => setNewProductForm({ ...newProductForm, productName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch-number">Batch Number *</Label>
                    <Input
                      id="batch-number"
                      placeholder="AMX-2024-001"
                      value={newProductForm.batchNumber}
                      onChange={(e) => setNewProductForm({ ...newProductForm, batchNumber: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="100"
                      value={newProductForm.quantity}
                      onChange={(e) => setNewProductForm({ ...newProductForm, quantity: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer">Manufacturing Facility *</Label>
                    <Input
                      id="manufacturer"
                      placeholder="PharmaCorp Ltd"
                      value={newProductForm.manufacturer}
                      onChange={(e) => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturing-date">Manufacturing Date</Label>
                    <Input
                      id="manufacturing-date"
                      type="date"
                      value={newProductForm.manufacturingDate}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, manufacturingDate: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={newProductForm.expiryDate}
                      onChange={(e) => setNewProductForm({ ...newProductForm, expiryDate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current-location">Current Location</Label>
                    <Input
                      id="current-location"
                      placeholder="Lagos Warehouse"
                      value={newProductForm.currentLocation}
                      onChange={(e) => setNewProductForm({ ...newProductForm, currentLocation: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="temperature">Storage Temperature</Label>
                    <Select
                      value={newProductForm.temperature}
                      onValueChange={(value) => setNewProductForm({ ...newProductForm, temperature: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select temperature requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-8°C">2-8°C (Refrigerated)</SelectItem>
                        <SelectItem value="Room Temperature">Room Temperature</SelectItem>
                        <SelectItem value="-20°C">-20°C (Frozen)</SelectItem>
                        <SelectItem value="Controlled">Controlled Room Temperature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleProductRegistration}
                  disabled={
                    !newProductForm.productName ||
                    !newProductForm.batchNumber ||
                    !newProductForm.manufacturer ||
                    isRegistering
                  }
                  className="w-full rounded-xl"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    "Register Product & Generate QR Code"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* My Products */}
            {batches.length > 0 && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>My Registered Products</CardTitle>
                  <CardDescription>Products you have registered on the blockchain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {batches.map((batch) => (
                      <Card key={batch._id} className="rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm">{batch.productName}</h4>
                            {batch.isFlagged && (
                              <Badge variant="destructive" className="text-xs">
                                Flagged
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Batch: {batch.batchNumber}</p>
                            <p>Quantity: {batch.quantity}</p>
                            <p className="text-xs text-muted-foreground">
                              Registered: {new Date(batch.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {batch.qrCode && (
                            <Button
                              onClick={() => {
                                setSelectedQRCode(batch.qrCode!)
                                setShowQRCodeDialog(true)
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full mt-3 rounded-xl bg-transparent"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              View QR Code
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Track Product Tab */}
        <TabsContent value="track" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Track Medical Product
              </CardTitle>
              <CardDescription>
                Enter batch number or scan QR code to track your medical product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Batch Number</Label>
                  <Input
                    id="search"
                    placeholder="Enter batch number (e.g., AMX-2024-001)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent rounded-xl"
                    onClick={handleOpenScanner}
                  >
                    <QrCode className="w-4 h-4" />
                    Scan QR
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleProductTrack}
                disabled={!searchQuery.trim() || isTracking}
                className="w-full rounded-xl"
              >
                {isTracking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Tracking Product...
                  </>
                ) : (
                  "Track Product"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Product Results - Only show for pharma users */}
          {userRole === "pharma" && filteredBatches.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map((batch) => (
                <Card
                  key={batch._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow rounded-2xl"
                  onClick={() => {
                    setSelectedProduct(batch)
                    setActiveTab("history")
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{batch.productName}</CardTitle>
                      <Badge
                        variant={batch.isFlagged ? "destructive" : "default"}
                        className={batch.isFlagged ? "" : "bg-secondary/20 text-secondary"}
                      >
                        {batch.isFlagged ? "Flagged" : "Verified"}
                      </Badge>
                    </div>
                    <CardDescription>Batch: {batch.batchNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Factory className="w-4 h-4 text-muted-foreground" />
                      <span>{batch.manufacturingFacility || "Unknown Facility"}</span>
                    </div>
                    {batch.expiryDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Expires: {new Date(batch.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Shield
                        className={`w-4 h-4 ${batch.isFlagged ? "text-destructive" : "text-secondary"}`}
                      />
                      <span
                        className={`text-sm font-medium ${batch.isFlagged ? "text-destructive" : "text-secondary"}`}
                      >
                        {batch.isFlagged ? "Authenticity Questionable" : "Verified Authentic"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {userRole === "pharma" && loading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
            </div>
          )}

          {userRole === "pharma" && !loading && filteredBatches.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {batches.length === 0 ? "No products found" : "No products match your search"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Verify Authenticity Tab */}
        <TabsContent value="verify" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Product Authenticity Verification
              </CardTitle>
              <CardDescription>
                Verify the authenticity of medical products using blockchain verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProduct ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Product Information</Label>
                      <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Product:</span>
                          <span className="text-sm font-medium">{selectedProduct.productName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Batch:</span>
                          <span className="text-sm font-medium">{selectedProduct.batchNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Manufacturer:</span>
                          <span className="text-sm font-medium">{selectedProduct.manufacturingFacility || "N/A"}</span>
                        </div>
                        {selectedProduct.manufacturingDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Mfg Date:</span>
                            <span className="text-sm font-medium">
                              {new Date(selectedProduct.manufacturingDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      className="w-full flex items-center gap-2 rounded-xl"
                      onClick={handleOpenScanner}
                    >
                      <Camera className="w-4 h-4" />
                      Scan Product QR Code
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Hedera Network Verification</Label>
                      <div
                        className={`${
                          selectedProduct.isFlagged
                            ? "bg-destructive/10 border-destructive/30"
                            : "bg-secondary/10 border-secondary/30"
                        } border rounded-xl p-4 space-y-3`}
                      >
                        <div className="flex items-center gap-2">
                          {selectedProduct.isFlagged ? (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-secondary" />
                          )}
                          <span
                            className={`font-medium ${selectedProduct.isFlagged ? "text-destructive" : "text-secondary"}`}
                          >
                            {selectedProduct.isFlagged ? "Product Flagged" : "Product Verified"}
                          </span>
                        </div>
                        {selectedProduct.isFlagged ? (
                          <div className="text-sm text-destructive">
                            <p>⚠ This product has been flagged for quality or authenticity issues</p>
                            {selectedProduct.flagReason && <p className="mt-2">Reason: {selectedProduct.flagReason}</p>}
                          </div>
                        ) : (
                          <div className="text-sm text-secondary space-y-1">
                            <p>✓ HCS hash verified</p>
                            <p>✓ Manufacturing records confirmed</p>
                            <p>✓ Chain of custody validated</p>
                            <p>✓ No issues reported</p>
                          </div>
                        )}
                        <div className="space-y-1 mt-2">
                          {selectedProduct.tokenId && (
                            <div className="text-xs text-muted-foreground">
                              <a
                                href={`https://hashscan.io/testnet/token/${selectedProduct.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline text-secondary"
                              >
                                Token ID: {selectedProduct.tokenId}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {selectedProduct.hcsMessageId && (
                            <div className="text-xs text-muted-foreground">
                              <a
                                href={`https://hashscan.io/testnet/transaction/${selectedProduct.hcsMessageId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:underline text-secondary"
                              >
                                HCS Txn Hash: {selectedProduct.hcsMessageId}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Select a product to verify its authenticity</p>
                  <Button onClick={() => setActiveTab("track")} variant="outline" className="mt-4 rounded-xl">
                    Track a Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supply Chain History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Supply Chain Timeline
              </CardTitle>
              <CardDescription>
                {selectedProduct
                  ? `Complete journey of ${selectedProduct.productName} from manufacturing to delivery`
                  : "Select a product to view its supply chain history"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProduct && selectedProduct.history && selectedProduct.history.length > 0 ? (
                <div className="space-y-6">
                  {selectedProduct.history.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.action === "MANUFACTURED"
                              ? "bg-primary/20"
                              : event.action === "ISSUE_REPORTED"
                                ? "bg-destructive/20"
                                : "bg-accent/20"
                          }`}
                        >
                          {event.action === "MANUFACTURED" ? (
                            <Factory
                              className={`w-5 h-5 ${
                                event.action === "MANUFACTURED"
                                  ? "text-primary"
                                  : event.action === "ISSUE_REPORTED"
                                    ? "text-destructive"
                                    : "text-accent"
                              }`}
                            />
                          ) : event.action === "ISSUE_REPORTED" ? (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          ) : (
                            <Truck className="w-5 h-5 text-accent" />
                          )}
                        </div>
                        {index < selectedProduct.history!.length - 1 && (
                          <div className="w-px h-12 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-foreground">{event.location}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.notes}</p>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {event.action.toLowerCase().replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedProduct ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No history available for this product</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Select a product to view its supply chain history</p>
                  <Button onClick={() => setActiveTab("track")} variant="outline" className="mt-4 rounded-xl">
                    Track a Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Issue Tab */}
        <TabsContent value="report" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Report Supply Chain Issue
              </CardTitle>
              <CardDescription>
                Report counterfeit products, temperature violations, or other supply chain issues to government health service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={fillTestReportData} className="text-xs bg-transparent">
                  Fill Test Data
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-id-report">Batch Number</Label>
                  <Input
                    id="product-id-report"
                    placeholder="Enter batch number"
                    value={reportForm.productId}
                    onChange={(e) => setReportForm({ ...reportForm, productId: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <Select
                    value={reportForm.issueType}
                    onValueChange={(value) => setReportForm({ ...reportForm, issueType: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select issue type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="counterfeit">Counterfeit Product</SelectItem>
                      <SelectItem value="temperature">Temperature Violation</SelectItem>
                      <SelectItem value="damaged">Damaged Packaging</SelectItem>
                      <SelectItem value="expired">Expired Product</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description-report">Issue Description</Label>
                <Textarea
                  id="description-report"
                  placeholder="Provide detailed description of the issue..."
                  rows={4}
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="location-report">Current Location</Label>
                <Input
                  id="location-report"
                  placeholder="Hospital/Clinic/Pharmacy name and address"
                  value={reportForm.location}
                  onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleReportSubmit}
                disabled={
                  !reportForm.productId ||
                  !reportForm.issueType ||
                  !reportForm.description ||
                  !reportForm.location ||
                  isSubmitting
                }
                className="w-full rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  "Submit Report to Government Health Service"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={showQRCodeDialog} onOpenChange={setShowQRCodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code or print it to attach to your product packaging
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {selectedQRCode && (
              <>
                <img src={selectedQRCode} alt="Product QR Code" className="w-64 h-64 border rounded-xl" />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = selectedQRCode
                      link.download = `product-qr-code-${Date.now()}.png`
                      link.click()
                    }}
                    variant="outline"
                    className="rounded-xl bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                  <Button onClick={() => window.print()} variant="outline" className="rounded-xl bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScannerDialog} onOpenChange={(open) => {
        setShowQRScannerDialog(open)
        if (!open) {
          setIsScannerActive(false)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Product QR Code</DialogTitle>
            <DialogDescription>
              Position the QR code within the camera view to scan
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div id="qr-reader" className="w-full"></div>
            <p className="text-sm text-muted-foreground text-center">
              Point your camera at a product QR code to track it
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
