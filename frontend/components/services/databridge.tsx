"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import {
  Database,
  ArrowRight,
  ArrowDown,
  Check,
  X,
  Shield,
  Eye,
  Search,
  Filter,
  Building2,
  User,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Globe,
  Lock,
  Share2,
  Download,
  Upload,
  History,
  Loader2,
  Stethoscope,
  Building,
  UserCircle,
  Heart,
  Pill,
  Landmark
} from "lucide-react"
import {
  createDataRequest,
  createDataShare,
  getIncomingRequests,
  getOutgoingRequests,
  getIncomingShares,
  getOutgoingShares,
  approveDataRequest,
  rejectDataRequest,
  revokeDataRequest,
  revokeDataShare,
  getAuditLogs,
  type DataRequest,
  type DataShare,
  type AuditLog
} from "@/lib/api/databridge"

interface DataBridgeProps {
  userRole?: "PATIENT" | "DOCTOR" | "HOSPITAL" | "LAB" | "INSURANCE" | "GOVERNMENT" | "NGO" | "PHARMA"
  userId?: string
}

const actorTypeIcons = {
  patient: UserCircle,
  doctor: Stethoscope,
  hospital: Building2,
  lab: FileText,
  insurance: Shield,
  government: Landmark,
  ngo: Heart,
  pharma: Pill
}

const availableDataTypes = [
  "Lab Results",
  "Vaccination Records",
  "Medical History",
  "Diagnosis Records",
  "Treatment History",
  "Prescription History",
  "Allergy Information",
  "Surgical Records",
  "Imaging Results",
  "Vital Signs",
  "Insurance Claims",
  "Payment Records",
  "Timeline Events",
  "All Records"
]

export default function DataBridgeEnhanced({ userRole = "PATIENT", userId }: DataBridgeProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("hub")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  // Data states
  const [incomingRequests, setIncomingRequests] = useState<DataRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<DataRequest[]>([])
  const [incomingShares, setIncomingShares] = useState<DataShare[]>([])
  const [outgoingShares, setOutgoingShares] = useState<DataShare[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // Modal states
  const [showShareForm, setShowShareForm] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null)

  // Form states
  const [shareForm, setShareForm] = useState({
    recipientId: "",
    recipientName: "",
    recipientType: "",
    dataToShare: [] as string[],
    purpose: "",
    expiryDate: "",
    accessDuration: 30
  })

  const [requestForm, setRequestForm] = useState({
    ownerId: "",
    ownerName: "",
    dataRequested: [] as string[],
    purpose: "",
    justification: "",
    validUntil: "",
    priority: "medium",
    accessDuration: 30
  })

  // Fetch data on mount and when tab changes
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === "incoming" || activeTab === "hub") {
        const reqData = await getIncomingRequests({ limit: 50 })
        setIncomingRequests(reqData.requests || [])
      }
      if (activeTab === "outgoing" || activeTab === "hub") {
        const reqData = await getOutgoingRequests({ limit: 50 })
        setOutgoingRequests(reqData.requests || [])

        const shareData = await getOutgoingShares({ limit: 50 })
        setOutgoingShares(shareData.shares || [])
      }
      if (activeTab === "logs") {
        const logData = await getAuditLogs({ limit: 50 })
        setAuditLogs(logData.logs || [])
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message || "Failed to load DataBridge data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateShare = async () => {
    if (!shareForm.recipientId || shareForm.dataToShare.length === 0 || !shareForm.purpose) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await createDataShare({
        recipientId: shareForm.recipientId,
        dataToShare: shareForm.dataToShare,
        purpose: shareForm.purpose,
        accessDuration: shareForm.accessDuration
      })

      toast({
        title: "Success",
        description: "Data share created successfully"
      })

      setShowShareForm(false)
      setShareForm({
        recipientId: "",
        recipientName: "",
        recipientType: "",
        dataToShare: [],
        purpose: "",
        expiryDate: "",
        accessDuration: 30
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create share",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!requestForm.ownerId || requestForm.dataRequested.length === 0 || !requestForm.purpose) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await createDataRequest({
        ownerId: requestForm.ownerId,
        dataRequested: requestForm.dataRequested,
        purpose: requestForm.purpose,
        justification: requestForm.justification,
        priority: requestForm.priority as any,
        accessDuration: requestForm.accessDuration
      })

      toast({
        title: "Success",
        description: "Data request created successfully"
      })

      setShowRequestForm(false)
      setRequestForm({
        ownerId: "",
        ownerName: "",
        dataRequested: [],
        purpose: "",
        justification: "",
        validUntil: "",
        priority: "medium",
        accessDuration: 30
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    setIsLoading(true)
    try {
      await approveDataRequest(requestId, {
        accessDuration: 14,
        notes: "Approved via DataBridge"
      })

      toast({
        title: "Success",
        description: "Request approved successfully"
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    setIsLoading(true)
    try {
      await rejectDataRequest(requestId, {
        reason: "Not authorized",
        notes: "Rejected via DataBridge"
      })

      toast({
        title: "Success",
        description: "Request rejected"
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeRequest = async (requestId: string) => {
    setIsLoading(true)
    try {
      await revokeDataRequest(requestId, {
        reason: "Access no longer needed"
      })

      toast({
        title: "Success",
        description: "Access revoked successfully"
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to revoke access",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeShare = async (shareId: string) => {
    setIsLoading(true)
    try {
      await revokeDataShare(shareId, {
        reason: "Share no longer needed"
      })

      toast({
        title: "Success",
        description: "Share revoked successfully"
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to revoke share",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      revoked: "bg-gray-100 text-gray-800",
      expired: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800"
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  const filteredRequests = incomingRequests.filter((request) => {
    const matchesSearch =
      request.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.purpose.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || request.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Role-based UI configuration
  const getRoleConfig = () => {
    const configs: Record<string, any> = {
      PATIENT: {
        primaryAction: "Share with Doctor",
        secondaryAction: "View Access Requests",
        description: "Control who can access your health records",
        showIncoming: true,
        showOutgoing: true,
        canApprove: true
      },
      DOCTOR: {
        primaryAction: "Request Patient Data",
        secondaryAction: "Share Findings",
        description: "Request and share patient health information",
        showIncoming: false,
        showOutgoing: true,
        canApprove: false
      },
      HOSPITAL: {
        primaryAction: "Request Records",
        secondaryAction: "Share Patient Data",
        description: "Exchange health records with other facilities",
        showIncoming: true,
        showOutgoing: true,
        canApprove: true
      },
      LAB: {
        primaryAction: "Share Test Results",
        secondaryAction: "Request Previous Results",
        description: "Share laboratory test results securely",
        showIncoming: true,
        showOutgoing: true,
        canApprove: true
      },
      INSURANCE: {
        primaryAction: "Request Claims Data",
        secondaryAction: "View Approvals",
        description: "Access health data for claims verification",
        showIncoming: false,
        showOutgoing: true,
        canApprove: false
      },
      GOVERNMENT: {
        primaryAction: "Request Health Data",
        secondaryAction: "Monitor Compliance",
        description: "Access data for public health monitoring",
        showIncoming: false,
        showOutgoing: true,
        canApprove: false
      },
      NGO: {
        primaryAction: "Request Research Data",
        secondaryAction: "View Access",
        description: "Access data for health programs and research",
        showIncoming: false,
        showOutgoing: true,
        canApprove: false
      },
      PHARMA: {
        primaryAction: "Request Research Data",
        secondaryAction: "View Clinical Data",
        description: "Access data for research and drug development",
        showIncoming: false,
        showOutgoing: true,
        canApprove: false
      }
    }
    return configs[userRole] || configs.PATIENT
  }

  const roleConfig = getRoleConfig()

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">DataBridge™</h1>
            <p className="text-muted-foreground">Health Data Exchange Network</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {userRole}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          {roleConfig.description} • Powered by Hedera Consensus Service
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-2xl bg-primary/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ArrowDown className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {incomingRequests.filter((r) => r.status === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {incomingRequests.filter((r) => r.status === "approved").length +
               outgoingShares.filter((s) => s.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">Active Shares</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{outgoingRequests.length}</p>
            <p className="text-sm text-muted-foreground">My Requests</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-purple-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{auditLogs.length}</p>
            <p className="text-sm text-muted-foreground">Audit Logs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="hub" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Hub
          </TabsTrigger>
          <TabsTrigger value="incoming" className="flex items-center gap-2">
            <ArrowDown className="w-4 h-4" />
            Incoming
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Outgoing
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* Exchange Hub */}
        <TabsContent value="hub" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common data exchange operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowShareForm(true)}
                  className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary rounded-xl"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {roleConfig.primaryAction}
                </Button>
                <Button
                  onClick={() => setShowRequestForm(true)}
                  className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Request Data Access
                </Button>
                <Button
                  onClick={() => setActiveTab("incoming")}
                  className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-600 rounded-xl"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review Pending ({incomingRequests.filter(r => r.status === "pending").length})
                </Button>
                <Button
                  onClick={() => setActiveTab("logs")}
                  className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl"
                >
                  <History className="w-4 h-4 mr-2" />
                  View Audit Trail
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest data exchange activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                ) : (
                  auditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.actor} → {log.target}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incoming Requests Tab */}
        <TabsContent value="incoming" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search requests..."
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
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-12 text-center">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No incoming requests</p>
                <p className="text-sm text-muted-foreground">
                  You don't have any data access requests at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const IconComponent = actorTypeIcons[request.requesterType as keyof typeof actorTypeIcons] || User
                return (
                  <Card key={request._id} className="rounded-2xl hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{request.requesterName}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{request.requesterType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityBadge(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusBadge(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Data Requested</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {request.dataRequested.map((data, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {data}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Purpose</Label>
                          <p className="text-sm text-muted-foreground mt-1">{request.purpose}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label className="text-xs font-medium">Request Date</Label>
                            <p className="text-muted-foreground">
                              {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Valid Until</Label>
                            <p className="text-muted-foreground">
                              {new Date(request.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Access Count</Label>
                            <p className="text-muted-foreground">{request.accessCount} times</p>
                          </div>
                        </div>
                      </div>

                      {request.status === "pending" && roleConfig.canApprove && (
                        <div className="flex gap-3 mt-4 pt-4 border-t">
                          <Button
                            onClick={() => handleApproveRequest(request._id)}
                            disabled={isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={isLoading}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}

                      {request.status === "approved" && roleConfig.canApprove && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            onClick={() => handleRevokeRequest(request._id)}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Revoke Access
                          </Button>
                        </div>
                      )}

                      {request.hcsApproveTx && (
                        <div className="mt-4 pt-4 border-t">
                          <Label className="text-xs font-medium">Blockchain Transaction</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {request.hcsApproveTx.substring(0, 30)}...
                            </code>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Outgoing Shares Tab */}
        <TabsContent value="outgoing" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Data Shares & Requests</h2>
            <div className="flex gap-2">
              <Button onClick={() => setShowShareForm(true)} className="rounded-xl">
                <Upload className="w-4 h-4 mr-2" />
                Share Data
              </Button>
              <Button onClick={() => setShowRequestForm(true)} variant="outline" className="rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Request Data
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Outgoing Shares */}
              {outgoingShares.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data I Shared</h3>
                  {outgoingShares.map((share) => {
                    const IconComponent = actorTypeIcons[share.recipientType as keyof typeof actorTypeIcons] || User
                    return (
                      <Card key={share._id} className="rounded-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{share.recipientName}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{share.recipientType}</p>
                              </div>
                            </div>
                            <Badge className={getStatusBadge(share.status)}>
                              {share.status}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Data Shared</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {share.dataShared.map((data, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {data}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Purpose</Label>
                              <p className="text-sm text-muted-foreground mt-1">{share.purpose}</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <Label className="text-xs font-medium">Shared Date</Label>
                                <p className="text-muted-foreground">
                                  {new Date(share.sharedDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium">Expiry Date</Label>
                                <p className="text-muted-foreground">
                                  {new Date(share.expiryDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium">Access Count</Label>
                                <p className="text-muted-foreground">{share.accessCount} times</p>
                              </div>
                            </div>
                          </div>

                          {share.status === "active" && (
                            <div className="mt-4 pt-4 border-t">
                              <Button
                                onClick={() => handleRevokeShare(share._id)}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Revoke Share
                              </Button>
                            </div>
                          )}

                          {share.hcsCreateTx && (
                            <div className="mt-4 pt-4 border-t">
                              <Label className="text-xs font-medium">Blockchain Transaction</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                  {share.hcsCreateTx.substring(0, 30)}...
                                </code>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* Outgoing Requests */}
              {outgoingRequests.length > 0 && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-lg font-semibold">My Data Requests</h3>
                  {outgoingRequests.map((request) => {
                    const IconComponent = actorTypeIcons[request.ownerType as keyof typeof actorTypeIcons] || User
                    return (
                      <Card key={request._id} className="rounded-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{request.ownerName}</h3>
                                <p className="text-sm text-muted-foreground capitalize">{request.ownerType}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityBadge(request.priority)}>
                                {request.priority}
                              </Badge>
                              <Badge className={getStatusBadge(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium">Data Requested</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {request.dataRequested.map((data, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {data}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Purpose</Label>
                              <p className="text-sm text-muted-foreground mt-1">{request.purpose}</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs font-medium">Request Date</Label>
                                <p className="text-muted-foreground">
                                  {new Date(request.requestDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium">Status</Label>
                                <p className="text-muted-foreground capitalize">{request.status}</p>
                              </div>
                            </div>
                          </div>

                          {request.hcsCreateTx && (
                            <div className="mt-4 pt-4 border-t">
                              <Label className="text-xs font-medium">Blockchain Transaction</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                  {request.hcsCreateTx.substring(0, 30)}...
                                </code>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {outgoingShares.length === 0 && outgoingRequests.length === 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Share2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">No outgoing shares or requests</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start sharing data or requesting access
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => setShowShareForm(true)} className="rounded-xl">
                        <Upload className="w-4 h-4 mr-2" />
                        Share Data
                      </Button>
                      <Button onClick={() => setShowRequestForm(true)} variant="outline" className="rounded-xl">
                        <Download className="w-4 h-4 mr-2" />
                        Request Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Complete history of all data exchange activities • Secured on Hedera Consensus Service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No audit logs yet</p>
                  <p className="text-sm text-muted-foreground">
                    Activity will appear here as you use DataBridge
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log, index) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                      <div className="relative">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        {index < auditLogs.length - 1 && (
                          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{log.action}</h4>
                            <p className="text-xs text-muted-foreground">
                              {log.actor} → {log.target}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs font-medium">Data Types</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {log.dataTypes.map((type, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Purpose</Label>
                            <p className="text-xs text-muted-foreground">{log.purpose}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                            <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                              {log.blockchainHashes.create || log.blockchainHashes.approve || 'Pending...'}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Data Modal */}
      {showShareForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Share Health Data</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowShareForm(false)} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Share your health data with healthcare providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientId">Recipient ID</Label>
                  <Input
                    id="recipientId"
                    value={shareForm.recipientId}
                    onChange={(e) => setShareForm((prev) => ({ ...prev, recipientId: e.target.value }))}
                    placeholder="Enter recipient user ID"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessDuration">Access Duration (days)</Label>
                  <Input
                    id="accessDuration"
                    type="number"
                    value={shareForm.accessDuration}
                    onChange={(e) => setShareForm((prev) => ({ ...prev, accessDuration: parseInt(e.target.value) }))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data to Share</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-xl">
                  {availableDataTypes.map((dataType) => (
                    <div key={dataType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`share-${dataType}`}
                        checked={shareForm.dataToShare.includes(dataType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setShareForm((prev) => ({ ...prev, dataToShare: [...prev.dataToShare, dataType] }))
                          } else {
                            setShareForm((prev) => ({
                              ...prev,
                              dataToShare: prev.dataToShare.filter((d) => d !== dataType),
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`share-${dataType}`} className="text-sm cursor-pointer">
                        {dataType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sharePurpose">Purpose</Label>
                <Textarea
                  id="sharePurpose"
                  value={shareForm.purpose}
                  onChange={(e) => setShareForm((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Explain why you're sharing this data"
                  className="rounded-xl min-h-20"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateShare}
                  disabled={isLoading || !shareForm.recipientId || shareForm.dataToShare.length === 0 || !shareForm.purpose}
                  className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Share Data
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowShareForm(false)} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Data Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Health Data</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowRequestForm(false)} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>Request access to patient or organization health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerId">Data Owner ID</Label>
                  <Input
                    id="ownerId"
                    value={requestForm.ownerId}
                    onChange={(e) => setRequestForm((prev) => ({ ...prev, ownerId: e.target.value }))}
                    placeholder="Enter data owner user ID"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={requestForm.priority}
                    onValueChange={(value) => setRequestForm((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data Requested</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-xl">
                  {availableDataTypes.map((dataType) => (
                    <div key={dataType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`req-${dataType}`}
                        checked={requestForm.dataRequested.includes(dataType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRequestForm((prev) => ({ ...prev, dataRequested: [...prev.dataRequested, dataType] }))
                          } else {
                            setRequestForm((prev) => ({
                              ...prev,
                              dataRequested: prev.dataRequested.filter((d) => d !== dataType),
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`req-${dataType}`} className="text-sm cursor-pointer">
                        {dataType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestPurpose">Purpose</Label>
                <Textarea
                  id="requestPurpose"
                  value={requestForm.purpose}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="Explain why you need this data"
                  className="rounded-xl min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  value={requestForm.justification}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, justification: e.target.value }))}
                  placeholder="Provide additional justification if needed"
                  className="rounded-xl min-h-16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestDuration">Access Duration (days)</Label>
                <Input
                  id="requestDuration"
                  type="number"
                  value={requestForm.accessDuration}
                  onChange={(e) => setRequestForm((prev) => ({ ...prev, accessDuration: parseInt(e.target.value) }))}
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateRequest}
                  disabled={isLoading || !requestForm.ownerId || requestForm.dataRequested.length === 0 || !requestForm.purpose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
                <Button onClick={() => setShowRequestForm(false)} variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
