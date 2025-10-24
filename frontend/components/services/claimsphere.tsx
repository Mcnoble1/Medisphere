"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  Shield,
  FileText,
  Plus,
  Calendar,
  DollarSign,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Upload,
  Copy,
  X,
} from "lucide-react"

interface InsurancePolicy {
  id: string
  provider: string
  policyNumber: string
  policyType: string
  coverageAmount: number
  premium: number
  startDate: string
  endDate: string
  status: "active" | "expired" | "suspended"
  coverageDetails: {
    inpatient: number
    outpatient: number
    dental: number
    optical: number
    maternity: number
  }
  dependents: number
}

interface Claim {
  id: string
  claimNumber: string
  policyId: string
  provider: string
  claimType: string
  claimAmount: number
  approvedAmount?: number
  dateSubmitted: string
  dateProcessed?: string
  status: "submitted" | "under-review" | "approved" | "rejected" | "paid"
  description: string
  diagnosis?: string
  treatmentDate: string
  healthcareProvider: string
  supportingDocuments: string[]
  adjusterComments?: string
  blockchainHash: string
}

const mockPolicies: InsurancePolicy[] = [
  {
    id: "1",
    provider: "Reliance HMO",
    policyNumber: "RHM-2024-001234",
    policyType: "Family Health Plan",
    coverageAmount: 5000000,
    premium: 180000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    coverageDetails: {
      inpatient: 3000000,
      outpatient: 500000,
      dental: 200000,
      optical: 150000,
      maternity: 800000,
    },
    dependents: 3,
  },
  {
    id: "2",
    provider: "AIICO Insurance",
    policyNumber: "AIC-2024-567890",
    policyType: "Individual Health Cover",
    coverageAmount: 2000000,
    premium: 120000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    coverageDetails: {
      inpatient: 1500000,
      outpatient: 300000,
      dental: 100000,
      optical: 75000,
      maternity: 0,
    },
    dependents: 0,
  },
]

const mockClaims: Claim[] = [
  {
    id: "1",
    claimNumber: "CL-2024-001",
    policyId: "1",
    provider: "Reliance HMO",
    claimType: "Outpatient",
    claimAmount: 25000,
    approvedAmount: 22500,
    dateSubmitted: "2024-01-10T10:00:00Z",
    dateProcessed: "2024-01-15T14:30:00Z",
    status: "paid",
    description: "General consultation and medication",
    diagnosis: "Hypertension management",
    treatmentDate: "2024-01-08",
    healthcareProvider: "Lagos University Teaching Hospital",
    supportingDocuments: ["prescription.pdf", "lab_results.pdf"],
    adjusterComments: "Claim approved as per policy terms",
    blockchainHash: "0x8f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4",
  },
  {
    id: "2",
    claimNumber: "CL-2024-002",
    policyId: "1",
    provider: "Reliance HMO",
    claimType: "Dental",
    claimAmount: 45000,
    dateSubmitted: "2024-01-20T09:15:00Z",
    status: "under-review",
    description: "Dental cleaning and filling",
    treatmentDate: "2024-01-18",
    healthcareProvider: "Smile Dental Clinic",
    supportingDocuments: ["dental_invoice.pdf", "xray.pdf"],
    blockchainHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4",
  },
  {
    id: "3",
    claimNumber: "CL-2024-003",
    policyId: "2",
    provider: "AIICO Insurance",
    claimType: "Inpatient",
    claimAmount: 150000,
    dateSubmitted: "2024-01-25T16:45:00Z",
    status: "submitted",
    description: "Emergency surgery and hospitalization",
    diagnosis: "Appendectomy",
    treatmentDate: "2024-01-23",
    healthcareProvider: "National Hospital Abuja",
    supportingDocuments: ["hospital_bill.pdf", "surgery_report.pdf", "discharge_summary.pdf"],
    blockchainHash: "0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3z2y1x0w9v8u7t6",
  },
]

const claimStatusIcons = {
  submitted: Clock,
  "under-review": AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  paid: CheckCircle,
}

const claimStatusColors = {
  submitted: "secondary",
  "under-review": "default",
  approved: "default",
  rejected: "destructive",
  paid: "default",
}

interface ClaimSphereProps {
  userRole?: string
}

export default function ClaimSphere({ userRole = "patient" }: ClaimSphereProps) {
  const [activeTab, setActiveTab] = useState("insurance")
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [claims, setClaims] = useState<Claim[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newClaim, setNewClaim] = useState({
    recordId: "",
    insurerId: "",
    claimType: "",
    claimAmount: "",
    description: "",
    diagnosis: "",
    treatmentDate: "",
    healthcareProvider: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [insurers, setInsurers] = useState<any[]>([])

  const testClaimData = {
    recordId: medicalRecords.length > 0 ? medicalRecords[0]._id : "",
    insurerId: insurers.length > 0 ? insurers[0]._id : "",
    claimType: "Outpatient",
    claimAmount: "35000",
    description:
      "Routine medical checkup including blood tests, consultation, and prescribed medication for ongoing health monitoring",
    diagnosis: "Routine health screening",
    treatmentDate: "2024-02-10",
    healthcareProvider: "Lagos General Hospital",
  }

  const fillTestClaimData = () => {
    setNewClaim(testClaimData)
  }

  // Load medical records
  const loadMedicalRecords = async () => {
    try {
      const response = await apiClient.getMyRecords({ limit: 50 })
      setMedicalRecords(response.records || [])
    } catch (error: any) {
      console.error("Error loading medical records:", error)
      // Don't show error - not critical
    }
  }

  // Load insurers
  const loadInsurers = async () => {
    try {
      const response = await apiClient.getInsurers()
      setInsurers(response.insurers || [])
    } catch (error: any) {
      console.error("Error loading insurers:", error)
      // Don't show error - not critical
    }
  }

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.healthcareProvider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || claim.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleClaimSubmit = async () => {
    if (
      newClaim.recordId &&
      newClaim.insurerId &&
      newClaim.claimAmount &&
      newClaim.description
    ) {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      try {
        console.log("Submitting claim:", newClaim)

        const claimData = {
          recordId: newClaim.recordId,
          insurerId: newClaim.insurerId,
          amountRequested: Number.parseFloat(newClaim.claimAmount),
          currency: "NGN",
          description: `${newClaim.description}${newClaim.diagnosis ? ` - Diagnosis: ${newClaim.diagnosis}` : ''}`,
          attachments: []
        }

        await apiClient.createClaim(claimData)

        setNewClaim({
          recordId: "",
          insurerId: "",
          claimType: "",
          claimAmount: "",
          description: "",
          diagnosis: "",
          treatmentDate: "",
          healthcareProvider: "",
        })
        setActiveTab("claims")
        setSuccess("Claim submitted successfully!")

        // Refresh claims list
        await loadClaims()
      } catch (error: any) {
        console.error("Error submitting claim:", error)
        setError(error.message || "Failed to submit claim")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClaimAction = async (claimId: string, action: "approve" | "reject") => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      console.log(`${action} claim ${claimId}`)

      if (action === "approve") {
        await apiClient.approveClaim(claimId, {
          amountApproved: undefined, // Use full requested amount
          payoutMethod: "HTS_TOKEN",
          payoutDetails: {
            tokenId: "0.0.123456", // Mock token ID
            toAccountId: "0.0.123456" // Mock account ID
          }
        })
        setSuccess("Claim approved successfully!")
      } else {
        await apiClient.rejectClaim(claimId, {
          reason: "Insufficient documentation or policy terms not met"
        })
        setSuccess("Claim rejected.")
      }

      // Refresh claims list
      await loadClaims()
    } catch (error: any) {
      console.error(`Error ${action}ing claim:`, error)
      setError(error.message || `Failed to ${action} claim`)
    } finally {
      setIsLoading(false)
    }
  }

  // Map backend status to frontend status
  const mapClaimStatus = (backendStatus: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'submitted',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'PAID': 'paid'
    }
    return statusMap[backendStatus] || backendStatus.toLowerCase()
  }

  const getClaimProgress = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    switch (normalizedStatus) {
      case "SUBMITTED":
      case "PENDING":
        return 25
      case "UNDER-REVIEW":
      case "REVIEWING":
        return 50
      case "APPROVED":
        return 75
      case "PAID":
        return 100
      case "REJECTED":
        return 100
      default:
        return 0
    }
  }

  // Load claims from API
  const loadClaims = async () => {
    try {
      const response = await apiClient.getClaimsList()

      // Convert API claims to UI format
      const apiClaims: Claim[] = response.claims?.map((claim: any) => ({
        id: claim._id,
        claimNumber: `CL-${claim._id.slice(-6)}`,
        policyId: claim.insurer?._id || "unknown",
        provider: claim.insurer?.name || `${claim.insurer?.firstName} ${claim.insurer?.lastName}` || "Unknown Insurance",
        claimType: "General", // API doesn't specify claim type
        claimAmount: claim.amountRequested,
        approvedAmount: claim.amountApproved || 0,
        dateSubmitted: claim.createdAt,
        dateProcessed: claim.updatedAt,
        status: mapClaimStatus(claim.status),
        description: claim.description,
        diagnosis: "",
        treatmentDate: claim.record?.date || claim.createdAt,
        healthcareProvider: claim.record?.facility || "Unknown Provider",
        supportingDocuments: claim.attachments || [],
        adjusterComments: claim.decisionReason,
        blockchainHash: claim.hcsEvents?.[0]?.hcsMessageId || "0x" + Math.random().toString(16).substring(2, 66),
      })) || []

      setClaims(apiClaims)
    } catch (error: any) {
      console.error("Error loading claims:", error)
      // Don't show error for loading as it's not critical
      // Fall back to mock data if API fails
      setClaims(mockClaims)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadClaims()
    loadMedicalRecords()
    loadInsurers()
  }, [])

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
          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ClaimSphere™</h1>
        </div>
        <Badge variant="secondary" className="mb-4 bg-secondary/20 text-secondary border-secondary/30 rounded-full">
          Insurance Claims System
        </Badge>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transparent insurance claims and coverage validation powered by Hedera blockchain
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="rounded-2xl bg-secondary/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary">
              {mockPolicies.filter((p) => p.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-primary/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{claims.length}</p>
            <p className="text-sm text-muted-foreground">Total Claims</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-accent/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">
              ₦
              {claims
                .filter((c) => c.approvedAmount)
                .reduce((sum, c) => sum + (c.approvedAmount || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Claims Approved</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-muted/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-muted-foreground">
              {claims.filter((c) => c.status === "under-review" || c.status === "submitted").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="insurance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              My Insurance
            </TabsTrigger>
            <TabsTrigger value="file-claim" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              File Claim
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Claims
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* My Insurance Tab */}
          <TabsContent value="insurance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {mockPolicies.map((policy) => (
                <Card
                  key={policy.id}
                  className="rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setSelectedPolicy(policy)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-secondary" />
                      </div>
                      <Badge
                        variant={policy.status === "active" ? "default" : "secondary"}
                        className={policy.status === "active" ? "bg-secondary/20 text-secondary" : ""}
                      >
                        {policy.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{policy.provider}</CardTitle>
                    <CardDescription>{policy.policyType}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Policy Number:</span>
                        <span className="font-medium">{policy.policyNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium">₦{policy.coverageAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Premium:</span>
                        <span className="font-medium">₦{policy.premium.toLocaleString()}/year</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Dependents:</span>
                        <span className="font-medium">{policy.dependents}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* File Claim Tab */}
          <TabsContent value="file-claim" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  File New Claim
                </CardTitle>
                <CardDescription>Submit a new insurance claim for medical expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recordSelect">Medical Record</Label>
                    <Select
                      value={newClaim.recordId}
                      onValueChange={(value) => {
                        const selectedRecord = medicalRecords.find(r => r._id === value)
                        setNewClaim({
                          ...newClaim,
                          recordId: value,
                          healthcareProvider: selectedRecord?.facility || "",
                          treatmentDate: selectedRecord?.date ? new Date(selectedRecord.date).toISOString().split('T')[0] : ""
                        })
                      }}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select medical record to claim" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicalRecords.length === 0 ? (
                          <SelectItem value="none" disabled>No medical records found</SelectItem>
                        ) : (
                          medicalRecords.map((record) => (
                            <SelectItem key={record._id} value={record._id}>
                              {record.title} - {new Date(record.date).toLocaleDateString()}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurerSelect">Insurance Provider</Label>
                    <Select
                      value={newClaim.insurerId}
                      onValueChange={(value) => setNewClaim({ ...newClaim, insurerId: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select insurance provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {insurers.length === 0 ? (
                          <SelectItem value="none" disabled>No insurers available</SelectItem>
                        ) : (
                          insurers.map((insurer) => (
                            <SelectItem key={insurer._id} value={insurer._id}>
                              {insurer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimAmount">Claim Amount (₦)</Label>
                    <Input
                      id="claimAmount"
                      type="number"
                      value={newClaim.claimAmount}
                      onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                      placeholder="0.00"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatmentDate">Treatment Date</Label>
                    <Input
                      id="treatmentDate"
                      type="date"
                      value={newClaim.treatmentDate}
                      onChange={(e) => setNewClaim({ ...newClaim, treatmentDate: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthcareProvider">Healthcare Provider</Label>
                  <Input
                    id="healthcareProvider"
                    value={newClaim.healthcareProvider}
                    onChange={(e) => setNewClaim({ ...newClaim, healthcareProvider: e.target.value })}
                    placeholder="Enter hospital or clinic name"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newClaim.description}
                    onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                    placeholder="Describe the medical treatment or service"
                    className="rounded-xl"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
                  <Input
                    id="diagnosis"
                    value={newClaim.diagnosis}
                    onChange={(e) => setNewClaim({ ...newClaim, diagnosis: e.target.value })}
                    placeholder="Medical diagnosis if available"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Supporting Documents</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload receipts, prescriptions, lab results, or other supporting documents
                    </p>
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-secondary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Blockchain Security</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your claim will be secured on the Hedera blockchain for transparency and fraud prevention.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleClaimSubmit}
                    disabled={
                      isLoading ||
                      !newClaim.recordId ||
                      !newClaim.insurerId ||
                      !newClaim.claimAmount ||
                      !newClaim.description
                    }
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isLoading ? "Submitting..." : "Submit Claim"}
                  </Button>
                  {medicalRecords.length > 0 && insurers.length > 0 && (
                    <Button onClick={fillTestClaimData} variant="outline" className="rounded-xl bg-transparent">
                      Fill Test Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Claims Tab */}
          <TabsContent value="claims" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search claims..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Claims</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredClaims.map((claim) => {
                const StatusIcon = claimStatusIcons[claim.status as keyof typeof claimStatusIcons]
                return (
                  <Card
                    key={claim.id}
                    className="rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedClaim(claim)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
                            <StatusIcon className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{claim.claimNumber}</h3>
                            <p className="text-sm text-muted-foreground">{claim.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={claimStatusColors[claim.status as keyof typeof claimStatusColors] as any}
                            className={
                              claim.status === "approved" || claim.status === "paid"
                                ? "bg-secondary/20 text-secondary"
                                : claim.status === "under-review"
                                  ? "bg-accent/20 text-accent"
                                  : claim.status === "submitted"
                                    ? "bg-primary/20 text-primary"
                                    : ""
                            }
                          >
                            {claim.status.replace("-", " ")}
                          </Badge>
                          <span className="text-lg font-bold">₦{claim.claimAmount.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Treatment:</span>
                          <span>{claim.description}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Provider:</span>
                          <span>{claim.healthcareProvider}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Submitted:</span>
                          <span>{new Date(claim.dateSubmitted).toLocaleDateString()}</span>
                        </div>
                        {claim.approvedAmount && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Approved Amount:</span>
                            <span className="text-secondary font-medium">₦{claim.approvedAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-muted-foreground">{getClaimProgress(claim.status)}%</span>
                        </div>
                        <Progress value={getClaimProgress(claim.status)} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-background/50 px-2 py-1 rounded font-mono">
                            {claim.blockchainHash.substring(0, 16)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(claim.blockchainHash)
                            }}
                            className="h-6 w-6 p-0 rounded"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          {userRole === "insurer" && claim.status === "submitted" && (
                            <>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleClaimAction(claim.id, "approve")
                                }}
                                disabled={isLoading}
                                size="sm"
                                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
                              >
                                {isLoading ? "Approving..." : "Approve"}
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleClaimAction(claim.id, "reject")
                                }}
                                disabled={isLoading}
                                variant="outline"
                                size="sm"
                                className="border-destructive text-destructive hover:bg-destructive/10 rounded-xl bg-transparent"
                              >
                                {isLoading ? "Rejecting..." : "Reject"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Claims History
                </CardTitle>
                <CardDescription>Complete history of all your insurance claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claims.map((claim, index) => {
                    const StatusIcon = claimStatusIcons[claim.status as keyof typeof claimStatusIcons]
                    return (
                      <div key={claim.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="relative">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              claim.status === "approved" || claim.status === "paid"
                                ? "bg-secondary/20"
                                : claim.status === "under-review"
                                  ? "bg-accent/20"
                                  : claim.status === "submitted"
                                    ? "bg-primary/20"
                                    : "bg-destructive/20"
                            }`}
                          >
                            <StatusIcon
                              className={`w-5 h-5 ${
                                claim.status === "approved" || claim.status === "paid"
                                  ? "text-secondary"
                                  : claim.status === "under-review"
                                    ? "text-accent"
                                    : claim.status === "submitted"
                                      ? "text-primary"
                                      : "text-destructive"
                              }`}
                            />
                          </div>
                          {index < claims.length - 1 && (
                            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-sm">{claim.claimNumber}</h4>
                              <p className="text-xs text-muted-foreground">{claim.description}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">₦{claim.claimAmount.toLocaleString()}</span>
                              {claim.approvedAmount && (
                                <p className="text-xs text-secondary">
                                  Approved: ₦{claim.approvedAmount.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{claim.healthcareProvider}</span>
                            <span>{new Date(claim.dateSubmitted).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedPolicy.provider}</CardTitle>
                  <CardDescription>{selectedPolicy.policyType}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPolicy(null)} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Policy Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedPolicy.policyNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={selectedPolicy.status === "active" ? "default" : "secondary"}
                    className={selectedPolicy.status === "active" ? "bg-secondary/20 text-secondary" : ""}
                  >
                    {selectedPolicy.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Coverage Details</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.entries(selectedPolicy.coverageDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted/30 rounded-xl">
                      <span className="text-sm capitalize">{key}:</span>
                      <span className="text-sm font-medium">₦{value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Policy Period</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPolicy.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedPolicy.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Annual Premium</Label>
                  <p className="text-sm text-muted-foreground">₦{selectedPolicy.premium.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedClaim.claimNumber}</CardTitle>
                  <CardDescription>
                    {selectedClaim.provider} • {selectedClaim.claimType}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedClaim(null)} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Claim Amount</Label>
                  <p className="text-lg font-bold">₦{selectedClaim.claimAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={claimStatusColors[selectedClaim.status as keyof typeof claimStatusColors] as any}
                    className={
                      selectedClaim.status === "approved" || selectedClaim.status === "paid"
                        ? "bg-secondary/20 text-secondary"
                        : selectedClaim.status === "under-review"
                          ? "bg-accent/20 text-accent"
                          : selectedClaim.status === "submitted"
                            ? "bg-primary/20 text-primary"
                            : ""
                    }
                  >
                    {selectedClaim.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedClaim.description}</p>
              </div>

              {selectedClaim.diagnosis && (
                <div>
                  <Label className="text-sm font-medium">Diagnosis</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedClaim.diagnosis}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Treatment Date</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedClaim.treatmentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Healthcare Provider</Label>
                  <p className="text-sm text-muted-foreground">{selectedClaim.healthcareProvider}</p>
                </div>
              </div>

              {selectedClaim.approvedAmount && (
                <div>
                  <Label className="text-sm font-medium">Approved Amount</Label>
                  <p className="text-lg font-bold text-secondary">₦{selectedClaim.approvedAmount.toLocaleString()}</p>
                </div>
              )}

              {selectedClaim.adjusterComments && (
                <div>
                  <Label className="text-sm font-medium">Adjuster Comments</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedClaim.adjusterComments}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Blockchain Hash</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted/30 px-3 py-2 rounded-xl text-sm flex-1 font-mono">
                    {selectedClaim.blockchainHash}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(selectedClaim.blockchainHash)}
                    className="rounded-xl"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
