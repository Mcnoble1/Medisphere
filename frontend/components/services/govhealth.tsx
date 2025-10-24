"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
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
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Bell,
  Calendar,
  Users,
  BarChart3,
  Award,
  ExternalLink,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface GovHealthProps {
  userRole?: string
}

export default function GovHealth({ userRole = "government" }: GovHealthProps) {
  const { toast } = useToast()

  // State for licenses
  const [licenses, setLicenses] = useState<any[]>([])
  const [loadingLicenses, setLoadingLicenses] = useState(true)

  // State for audits
  const [audits, setAudits] = useState<any[]>([])
  const [loadingAudits, setLoadingAudits] = useState(false)

  // State for compliance stats
  const [complianceStats, setComplianceStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // State for public health data
  const [publicHealthData, setPublicHealthData] = useState<any>(null)
  const [loadingPublicData, setLoadingPublicData] = useState(false)

  const [newLicenseForm, setNewLicenseForm] = useState({
    issuedTo: "",
    issuedToType: "" as 'practitioner' | 'facility' | 'lab' | 'pharmacy' | "",
    issuedBy: "",
    validFrom: "",
    validUntil: "",
    complianceRequirements: "",
  })

  const [newAuditForm, setNewAuditForm] = useState({
    targetEntity: "",
    performedBy: "",
    summary: "",
    findings: "",
    severity: "" as 'low' | 'medium' | 'high' | "",
    targetLicenseId: "",
  })

  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false)
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false)
  const [isRenewingLicense, setIsRenewingLicense] = useState(false)
  const [showNewLicenseDialog, setShowNewLicenseDialog] = useState(false)
  const [showNewAuditDialog, setShowNewAuditDialog] = useState(false)

  // Load licenses on mount
  useEffect(() => {
    loadLicenses()
    loadComplianceStats()
  }, [])

  const loadLicenses = async () => {
    try {
      setLoadingLicenses(true)
      const response = await apiClient.listLicenses()
      setLicenses(response.licenses || [])
    } catch (error: any) {
      toast({
        title: "Error loading licenses",
        description: error.message || "Failed to load licenses",
        variant: "destructive",
      })
    } finally {
      setLoadingLicenses(false)
    }
  }

  const loadAudits = async () => {
    try {
      setLoadingAudits(true)
      const response = await apiClient.listAudits()
      setAudits(response.audits || [])
    } catch (error: any) {
      toast({
        title: "Error loading audits",
        description: error.message || "Failed to load audits",
        variant: "destructive",
      })
    } finally {
      setLoadingAudits(false)
    }
  }

  const loadComplianceStats = async () => {
    try {
      setLoadingStats(true)
      const stats = await apiClient.getComplianceStats()
      setComplianceStats(stats)
    } catch (error: any) {
      toast({
        title: "Error loading compliance stats",
        description: error.message || "Failed to load compliance statistics",
        variant: "destructive",
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const loadPublicHealthData = async () => {
    try {
      setLoadingPublicData(true)
      const data = await apiClient.getPublicHealthData()
      setPublicHealthData(data)
    } catch (error: any) {
      toast({
        title: "Error loading public health data",
        description: error.message || "Failed to load public health data",
        variant: "destructive",
      })
    } finally {
      setLoadingPublicData(false)
    }
  }

  const handleLicenseApplication = async () => {
    if (!newLicenseForm.issuedTo || !newLicenseForm.issuedToType || !newLicenseForm.issuedBy ||
        !newLicenseForm.validFrom || !newLicenseForm.validUntil) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmittingLicense(true)

      const licenseData = {
        issuedTo: newLicenseForm.issuedTo,
        issuedToType: newLicenseForm.issuedToType as 'practitioner' | 'facility' | 'lab' | 'pharmacy',
        issuedBy: newLicenseForm.issuedBy,
        validFrom: newLicenseForm.validFrom,
        validUntil: newLicenseForm.validUntil,
        complianceRequirements: newLicenseForm.complianceRequirements
          ? newLicenseForm.complianceRequirements.split(',').map(r => r.trim())
          : [],
      }

      await apiClient.issueLicense(licenseData)

      toast({
        title: "License issued successfully",
        description: "The license has been issued and recorded on blockchain",
      })

      // Reset form and close dialog
      setNewLicenseForm({
        issuedTo: "",
        issuedToType: "",
        issuedBy: "",
        validFrom: "",
        validUntil: "",
        complianceRequirements: "",
      })
      setShowNewLicenseDialog(false)

      // Reload licenses
      await loadLicenses()
      await loadComplianceStats()
    } catch (error: any) {
      toast({
        title: "Error issuing license",
        description: error.message || "Failed to issue license",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingLicense(false)
    }
  }

  const handleAuditSubmission = async () => {
    if (!newAuditForm.targetEntity || !newAuditForm.performedBy ||
        !newAuditForm.summary || !newAuditForm.severity) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmittingAudit(true)

      const auditData = {
        targetEntity: newAuditForm.targetEntity,
        performedBy: newAuditForm.performedBy,
        summary: newAuditForm.summary,
        findings: newAuditForm.findings
          ? newAuditForm.findings.split('\n').filter(f => f.trim())
          : [],
        severity: newAuditForm.severity as 'low' | 'medium' | 'high',
        targetLicenseId: newAuditForm.targetLicenseId || undefined,
      }

      await apiClient.createAudit(auditData)

      toast({
        title: "Audit recorded successfully",
        description: "The audit has been recorded on blockchain",
      })

      // Reset form and close dialog
      setNewAuditForm({
        targetEntity: "",
        performedBy: "",
        summary: "",
        findings: "",
        severity: "",
        targetLicenseId: "",
      })
      setShowNewAuditDialog(false)

      // Reload audits if they were loaded
      if (audits.length > 0) {
        await loadAudits()
      }
      await loadComplianceStats()
    } catch (error: any) {
      toast({
        title: "Error recording audit",
        description: error.message || "Failed to record audit",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingAudit(false)
    }
  }

  const handleLicenseRenewal = async (licenseId: string) => {
    try {
      setIsRenewingLicense(true)

      // Calculate new expiry date (1 year from now)
      const newExpiryDate = new Date()
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1)

      await apiClient.updateLicenseStatus(licenseId, {
        status: 'active',
        updatedBy: 'system', // In production, use actual user ID
        reason: 'License renewed',
      })

      toast({
        title: "License renewed successfully",
        description: "The license has been renewed and recorded on blockchain",
      })

      // Reload licenses
      await loadLicenses()
      await loadComplianceStats()
    } catch (error: any) {
      toast({
        title: "Error renewing license",
        description: error.message || "Failed to renew license",
        variant: "destructive",
      })
    } finally {
      setIsRenewingLicense(false)
    }
  }

  const fillTestLicenseData = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextYear = new Date()
    nextYear.setFullYear(nextYear.getFullYear() + 1)

    setNewLicenseForm({
      issuedTo: "did:hedera:testnet:test123",
      issuedToType: "practitioner",
      issuedBy: "Medical Council of Nigeria",
      validFrom: tomorrow.toISOString().split('T')[0],
      validUntil: nextYear.toISOString().split('T')[0],
      complianceRequirements: "Medical degree, Current practicing certificate, Malpractice insurance",
    })
  }

  const fillTestAuditData = () => {
    setNewAuditForm({
      targetEntity: "did:hedera:testnet:facility456",
      performedBy: "did:hedera:testnet:auditor789",
      summary: "Routine compliance audit for facility operations and standards",
      findings: "All safety protocols followed\nEquipment properly maintained\nStaff adequately trained",
      severity: "low",
      targetLicenseId: licenses.length > 0 ? licenses[0]._id : "",
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'expired':
      case 'revoked':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getDaysUntilExpiry = (validUntil: string) => {
    const today = new Date()
    const expiryDate = new Date(validUntil)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Regulatory Compliance Portal</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Blockchain-powered regulatory compliance, public health reporting, and license management for healthcare
          organizations
        </p>
      </div>

      {/* Compliance Overview */}
      {loadingStats ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : complianceStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Active Licenses</h4>
                <Badge variant="default">{complianceStats.licenses.active}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Currently valid licenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Expiring Soon</h4>
                <Badge variant="secondary">{complianceStats.licenses.expiringSoon}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Compliance Score</h4>
                <Badge variant="default">{complianceStats.complianceScore}%</Badge>
              </div>
              <Progress value={complianceStats.complianceScore} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">Overall compliance rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">Total Audits</h4>
                <Badge variant="default">{complianceStats.audits.total}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {complianceStats.audits.highSeverity} high severity
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Compliance Dashboard</TabsTrigger>
          <TabsTrigger value="licenses">License Management</TabsTrigger>
          <TabsTrigger value="audits">Audit Management</TabsTrigger>
          <TabsTrigger value="public-health">Public Health Data</TabsTrigger>
        </TabsList>

        {/* Compliance Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Compliance Status Overview
                </CardTitle>
                <CardDescription>Current compliance status across all regulatory areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Compliance Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={complianceStats.complianceScore} className="w-20 h-2" />
                        <span className="font-medium">{complianceStats.complianceScore}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Active Licenses:</span>
                        <span className="font-medium text-green-500">{complianceStats.licenses.active}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Expiring Soon:</span>
                        <span className="font-medium text-yellow-500">{complianceStats.licenses.expiringSoon}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Expired Licenses:</span>
                        <span className="font-medium text-red-500">{complianceStats.licenses.expired}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Total Audits:</span>
                        <span className="font-medium text-blue-500">{complianceStats.audits.total}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Blockchain Compliance Verification
                </CardTitle>
                <CardDescription>
                  All compliance records are immutably stored on Hedera for transparency and auditability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700">Compliance Records Verified</span>
                  </div>
                  <div className="text-sm text-green-600 space-y-1">
                    <p>✓ All licenses recorded on blockchain</p>
                    <p>✓ Audit submissions timestamped immutably</p>
                    <p>✓ Regulatory updates tracked transparently</p>
                    <p>✓ Full audit trail available for inspections</p>
                  </div>
                  <div className="text-xs text-green-500 mt-2">
                    HCS Topic: {process.env.NEXT_PUBLIC_HEDERA_TOPIC_ID || '0.0.xxxxxx'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* License Management Tab */}
        <TabsContent value="licenses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Healthcare License Management
                  </CardTitle>
                  <CardDescription>Track and manage all healthcare licenses and certifications</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadLicenses} disabled={loadingLicenses}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingLicenses ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Dialog open={showNewLicenseDialog} onOpenChange={setShowNewLicenseDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Issue License
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Issue New License</DialogTitle>
                        <DialogDescription>
                          Issue a new healthcare license and record it on the blockchain
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={fillTestLicenseData} className="text-xs bg-transparent">
                            Fill Test Data
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="issuedTo">Issued To (DID) *</Label>
                            <Input
                              id="issuedTo"
                              placeholder="did:hedera:testnet:..."
                              value={newLicenseForm.issuedTo}
                              onChange={(e) => setNewLicenseForm({ ...newLicenseForm, issuedTo: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="issuedToType">License Type *</Label>
                            <Select
                              value={newLicenseForm.issuedToType}
                              onValueChange={(value: any) =>
                                setNewLicenseForm({ ...newLicenseForm, issuedToType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="practitioner">Practitioner</SelectItem>
                                <SelectItem value="facility">Facility</SelectItem>
                                <SelectItem value="lab">Laboratory</SelectItem>
                                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="issuedBy">Issued By *</Label>
                            <Input
                              id="issuedBy"
                              placeholder="Issuing authority"
                              value={newLicenseForm.issuedBy}
                              onChange={(e) => setNewLicenseForm({ ...newLicenseForm, issuedBy: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="validFrom">Valid From *</Label>
                            <Input
                              id="validFrom"
                              type="date"
                              value={newLicenseForm.validFrom}
                              onChange={(e) => setNewLicenseForm({ ...newLicenseForm, validFrom: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="validUntil">Valid Until *</Label>
                            <Input
                              id="validUntil"
                              type="date"
                              value={newLicenseForm.validUntil}
                              onChange={(e) => setNewLicenseForm({ ...newLicenseForm, validUntil: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="complianceRequirements">Compliance Requirements (comma-separated)</Label>
                          <Textarea
                            id="complianceRequirements"
                            placeholder="e.g., Medical degree, Current certificate, Insurance"
                            rows={3}
                            value={newLicenseForm.complianceRequirements}
                            onChange={(e) =>
                              setNewLicenseForm({ ...newLicenseForm, complianceRequirements: e.target.value })
                            }
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button
                            onClick={handleLicenseApplication}
                            disabled={isSubmittingLicense}
                            className="flex-1"
                          >
                            {isSubmittingLicense ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Issuing License...
                              </>
                            ) : (
                              "Issue License"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingLicenses ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : licenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No licenses found. Issue your first license to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {licenses.map((license) => {
                    const daysUntilExpiry = getDaysUntilExpiry(license.validUntil)
                    return (
                      <div key={license._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-foreground">
                            License #{license.licenseNumber}
                          </h4>
                          <Badge variant={getStatusBadgeVariant(license.status)}>{license.status}</Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Issued To:</span>
                            <p className="font-medium truncate">{license.issuedTo}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p className="font-medium capitalize">{license.issuedToType}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issued By:</span>
                            <p className="font-medium">{license.issuedBy}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valid From:</span>
                            <p className="font-medium">{new Date(license.validFrom).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valid Until:</span>
                            <p className="font-medium">{new Date(license.validUntil).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">HCS Message ID:</span>
                            <p className="font-medium text-xs truncate">{license.hcsMessageId || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            {daysUntilExpiry > 0 && daysUntilExpiry <= 30 ? (
                              <>
                                <Clock className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Expires in {daysUntilExpiry} days</span>
                              </>
                            ) : daysUntilExpiry <= 0 ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <span className="text-sm">Expired</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm">Valid</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {license.status === 'active' && (
                              <Button
                                size="sm"
                                onClick={() => handleLicenseRenewal(license._id)}
                                disabled={isRenewingLicense}
                              >
                                {isRenewingLicense ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  "Renew"
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Management Tab */}
        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Audit Management
                  </CardTitle>
                  <CardDescription>Create and manage regulatory audits</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadAudits} disabled={loadingAudits}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingAudits ? 'animate-spin' : ''}`} />
                    {audits.length === 0 ? 'Load Audits' : 'Refresh'}
                  </Button>
                  <Dialog open={showNewAuditDialog} onOpenChange={setShowNewAuditDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Audit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Audit</DialogTitle>
                        <DialogDescription>Record a new regulatory audit on the blockchain</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={fillTestAuditData} className="text-xs bg-transparent">
                            Fill Test Data
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="targetEntity">Target Entity (DID) *</Label>
                            <Input
                              id="targetEntity"
                              placeholder="did:hedera:testnet:..."
                              value={newAuditForm.targetEntity}
                              onChange={(e) => setNewAuditForm({ ...newAuditForm, targetEntity: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="performedBy">Performed By (DID) *</Label>
                            <Input
                              id="performedBy"
                              placeholder="did:hedera:testnet:..."
                              value={newAuditForm.performedBy}
                              onChange={(e) => setNewAuditForm({ ...newAuditForm, performedBy: e.target.value })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="severity">Severity *</Label>
                            <Select
                              value={newAuditForm.severity}
                              onValueChange={(value: any) => setNewAuditForm({ ...newAuditForm, severity: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="targetLicenseId">Related License ID (Optional)</Label>
                            <Select
                              value={newAuditForm.targetLicenseId}
                              onValueChange={(value) =>
                                setNewAuditForm({ ...newAuditForm, targetLicenseId: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select license (optional)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {licenses.map((license) => (
                                  <SelectItem key={license._id} value={license._id}>
                                    {license.licenseNumber} - {license.issuedToType}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="summary">Audit Summary *</Label>
                          <Textarea
                            id="summary"
                            placeholder="Brief summary of the audit..."
                            rows={3}
                            value={newAuditForm.summary}
                            onChange={(e) => setNewAuditForm({ ...newAuditForm, summary: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="findings">Findings (one per line)</Label>
                          <Textarea
                            id="findings"
                            placeholder="List audit findings, one per line..."
                            rows={4}
                            value={newAuditForm.findings}
                            onChange={(e) => setNewAuditForm({ ...newAuditForm, findings: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={handleAuditSubmission} disabled={isSubmittingAudit} className="flex-1">
                            {isSubmittingAudit ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Recording Audit...
                              </>
                            ) : (
                              "Record Audit"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAudits ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : audits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No audits found. Click &quot;Load Audits&quot; or create your first audit.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div key={audit._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground">Audit #{audit.auditId}</h4>
                        <Badge
                          variant={
                            audit.severity === 'high'
                              ? 'destructive'
                              : audit.severity === 'medium'
                                ? 'secondary'
                                : 'default'
                          }
                        >
                          {audit.severity} severity
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{audit.summary}</p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Target Entity:</span>
                          <p className="font-medium truncate">{audit.targetEntity}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Performed By:</span>
                          <p className="font-medium truncate">{audit.performedBy}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date:</span>
                          <p className="font-medium">{new Date(audit.auditDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {audit.findings && audit.findings.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">Findings:</span>
                          <ul className="list-disc list-inside text-sm mt-1">
                            {audit.findings.map((finding: string, idx: number) => (
                              <li key={idx}>{finding}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {audit.hcsMessageId && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          HCS Message ID: {audit.hcsMessageId}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public Health Data Tab */}
        <TabsContent value="public-health" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Public Health Data
                  </CardTitle>
                  <CardDescription>Aggregated public health statistics from the blockchain</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadPublicHealthData} disabled={loadingPublicData}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingPublicData ? 'animate-spin' : ''}`} />
                  {publicHealthData ? 'Refresh' : 'Load Data'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPublicData ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : publicHealthData ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Event Type Distribution</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(publicHealthData.counts || {}).map(([type, count]: [string, any]) => (
                        <Card key={type}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{type.replace(/_/g, ' ')}</span>
                              <Badge>{count}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {publicHealthData.messages && publicHealthData.messages.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-4">Recent Events (Last 50)</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {publicHealthData.messages.map((msg: any, idx: number) => (
                          <div key={idx} className="border rounded p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{msg.message?.type || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">
                                {msg.consensusTimestamp}
                              </span>
                            </div>
                            {msg.message && (
                              <div className="text-xs text-muted-foreground">
                                {JSON.stringify(msg.message, null, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click &quot;Load Data&quot; to view public health statistics from the blockchain</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
