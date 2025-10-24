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
import {
  FileText,
  Clock,
  Upload,
  Search,
  Filter,
  Share2,
  Shield,
  Edit3,
  AlertCircle,
  Users,
  TestTube,
  Pill,
  Stethoscope,
  Syringe,
  Scissors,
  Plus,
  Eye,
  Copy,
  Download,
  X,
  ExternalLink,
  Award,
} from "lucide-react"

interface HealthRecord {
  id: string
  type: "lab-result" | "prescription" | "diagnosis" | "vaccination" | "surgery" | "other"
  title: string
  date: string
  doctor: string
  facility: string
  notes: string
  attachments: Array<{
    filename: string
    url: string
    size: number
  }>
  consentRecipients: string[]
  isShared: boolean
  blockchainHash?: string // Legacy
  hcsHash?: string // Hedera HCS transaction ID
  hcsTopicId?: string
  ipfsCid?: string // IPFS Content Identifier
  ipfsUrl?: string
  nftData?: {
    tokenId: string
    serial: number
    nftId: string
    transactionId: string
    transferTransactionId?: string
    ownerAccountId?: string
    transferred?: boolean
    funded?: boolean
  }
  patientId?: string
  patientName?: string
  canEdit?: boolean
  addedBy?: string
  addedByRole?: string
}

interface LifeChainProps {
  userRole?: "patient" | "doctor" | "ngo"
}

const recordTypeIcons = {
  "lab-result": TestTube,
  prescription: Pill,
  diagnosis: Stethoscope,
  vaccination: Syringe,
  surgery: Scissors,
  other: FileText,
}

const mockRecords: HealthRecord[] = [
  {
    id: "1",
    type: "lab-result",
    title: "Complete Blood Count (CBC)",
    date: "2024-01-15",
    doctor: "Dr. Sarah Johnson",
    facility: "Lagos General Hospital",
    notes: "All values within normal range. Hemoglobin: 13.2 g/dL, White blood cells: 6,800/μL",
    attachments: [{ filename: "lab-report-cbc.pdf", url: "/files/lab-report-cbc.pdf", size: 245600 }],
    consentRecipients: ["Dr. Michael Adebayo", "City Insurance"],
    isShared: true,
    blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
    hcsHash: "0.0.123@1234567890.000000000",
    patientId: "patient-001",
    patientName: "John Doe",
    canEdit: false,
    addedBy: "Lab Technician",
    addedByRole: "technician",
  },
  {
    id: "2",
    type: "prescription",
    title: "Hypertension Medication",
    date: "2024-01-10",
    doctor: "Dr. Michael Adebayo",
    facility: "Heart Care Clinic",
    notes: "Lisinopril 10mg once daily. Monitor blood pressure weekly. Follow up in 4 weeks.",
    attachments: [],
    consentRecipients: ["Pharmacy Plus", "Health Insurance Co."],
    isShared: true,
    blockchainHash: "0x2b3c4d5e6f7890abcdef1234567890ab",
    hcsHash: "0.0.123@1234567891.000000000",
    ipfsCid: "QmX1234567890abcdef",
    patientId: "patient-001",
    patientName: "John Doe",
    canEdit: true,
    addedBy: "Dr. Michael Adebayo",
    addedByRole: "doctor",
  },
  {
    id: "3",
    type: "vaccination",
    title: "COVID-19 Booster Shot",
    date: "2024-01-05",
    doctor: "Nurse Patricia Okafor",
    facility: "Community Health Center",
    notes: "Pfizer-BioNTech COVID-19 vaccine booster administered. No adverse reactions observed.",
    attachments: [{ filename: "vaccination-certificate.pdf", url: "/files/vaccination-certificate.pdf", size: 158720 }],
    consentRecipients: [],
    isShared: false,
    blockchainHash: "0x3c4d5e6f7890abcdef1234567890abcd",
    hcsHash: "0.0.123@1234567892.000000000",
    patientId: "patient-001",
    patientName: "John Doe",
    canEdit: false,
    addedBy: "Nurse Patricia Okafor",
    addedByRole: "nurse",
  },
]

// Helper function to get HashScan URL for a transaction
const getHashScanUrl = (transactionId: string, network: 'mainnet' | 'testnet' = 'testnet') => {
  return `https://hashscan.io/${network}/transaction/${transactionId}`
}

// Helper function to get HashScan URL for an NFT
const getNFTHashScanUrl = (nftId: string, network: 'mainnet' | 'testnet' = 'testnet') => {
  return `https://hashscan.io/${network}/token/${nftId.replace('/', '/')}`
}

export default function LifeChain({ userRole = "patient" }: LifeChainProps) {
  const [activeTab, setActiveTab] = useState("timeline")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [isEditingRecord, setIsEditingRecord] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newRecord, setNewRecord] = useState({
    type: "",
    title: "",
    date: "",
    doctor: "",
    facility: "",
    notes: "",
    patientId: "",
  })

  // Fetch records on component mount
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        if (userRole === "patient") {
          const response = await apiClient.getMyRecords({
            type: filterType === 'all' ? undefined : filterType,
            limit: 50
          })

          // Transform backend records to frontend format
          const transformedRecords = (response.records || []).map(record => ({
            id: record._id,
            type: record.type,
            title: record.title,
            date: record.date,
            doctor: record.doctor,
            facility: record.facility,
            notes: record.notes || "",
            attachments: record.attachments.map(a => ({
              filename: a.filename,
              url: a.url,
              size: a.size
            })),
            consentRecipients: record.consentRecipients,
            isShared: record.isShared,
            blockchainHash: record.blockchainHash,
            hcsHash: record.hcsHash,
            hcsTopicId: record.hcsTopicId,
            ipfsCid: record.ipfsCid,
            ipfsUrl: record.ipfsUrl,
            nftData: record.nftData,
            patientId: record.patient._id,
            patientName: `${record.patient.firstName} ${record.patient.lastName}`,
            canEdit: record.canEdit,
            addedBy: `${record.addedBy.firstName} ${record.addedBy.lastName}`,
            addedByRole: record.addedByRole,
          }))

          setRecords(transformedRecords)
        } else {
          // For doctors/NGOs, we'd need a different endpoint
          // For now, use mock data
          setRecords(mockRecords)
        }
      } catch (error) {
        console.error('Error fetching records:', error)
        // Fallback to mock data
        setRecords(mockRecords)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [userRole, filterType])

  const testRecordData = {
    "lab-result": {
      type: "lab-result",
      title: "Complete Blood Count (CBC)",
      date: "2024-01-20",
      doctor: "Dr. Sarah Johnson",
      facility: "Lagos General Hospital",
      notes:
        "All values within normal range. Hemoglobin: 13.2 g/dL, White blood cells: 6,800/μL, Platelets: 250,000/μL",
    },
    prescription: {
      type: "prescription",
      title: "Hypertension Medication",
      date: "2024-01-18",
      doctor: "Dr. Michael Adebayo",
      facility: "Heart Care Clinic",
      notes:
        "Lisinopril 10mg once daily. Monitor blood pressure weekly. Follow up in 4 weeks. Avoid high sodium foods.",
    },
    diagnosis: {
      type: "diagnosis",
      title: "Type 2 Diabetes Mellitus",
      date: "2024-01-15",
      doctor: "Dr. Fatima Bello",
      facility: "Endocrine Clinic",
      notes: "HbA1c: 7.2%. Recommend lifestyle modifications, dietary changes, and metformin 500mg twice daily.",
    },
    vaccination: {
      type: "vaccination",
      title: "COVID-19 Booster Shot",
      date: "2024-01-10",
      doctor: "Nurse Patricia Okafor",
      facility: "Community Health Center",
      notes:
        "Pfizer-BioNTech COVID-19 vaccine booster administered. No adverse reactions observed. Next dose due in 6 months.",
    },
  }

  const fillTestRecordData = (recordType?: string) => {
    const type = recordType || newRecord.type
    const data = testRecordData[type as keyof typeof testRecordData]
    if (data) {
      setNewRecord((prev) => ({ ...prev, ...data }))
    }
  }

  const handleSubmitRecord = async () => {
    if (!newRecord.type || !newRecord.title || !newRecord.date) {
      alert("Please fill in all required fields")
      return
    }

    // For doctors/NGOs, patientId is required
    if (['doctor', 'ngo'].includes(userRole) && !newRecord.patientId) {
      alert("Patient ID is required for healthcare providers")
      return
    }

    setIsLoading(true)
    try {
      // Doctors and NGOs can create full records
      if (['doctor', 'ngo'].includes(userRole)) {
        const response = await apiClient.createRecord({
          patientId: newRecord.patientId,
          type: newRecord.type,
          title: newRecord.title,
          date: newRecord.date,
          doctor: newRecord.doctor,
          facility: newRecord.facility,
          notes: newRecord.notes,
        })

        // Transform backend record to match frontend interface
        const transformedRecord: HealthRecord = {
          id: response.record._id,
          type: response.record.type,
          title: response.record.title,
          date: response.record.date,
          doctor: response.record.doctor,
          facility: response.record.facility,
          notes: response.record.notes || "",
          attachments: response.record.attachments.map(a => ({
            filename: a.filename,
            url: a.url,
            size: a.size
          })),
          consentRecipients: response.record.consentRecipients,
          isShared: response.record.isShared,
          blockchainHash: response.record.blockchainHash,
          hcsHash: response.record.hcsHash,
          hcsTopicId: response.record.hcsTopicId,
          ipfsCid: response.record.ipfsCid,
          ipfsUrl: response.record.ipfsUrl,
          nftData: response.record.nftData,
          patientId: response.record.patient._id,
          patientName: `${response.record.patient.firstName} ${response.record.patient.lastName}`,
          canEdit: response.record.canEdit,
          addedBy: `${response.record.addedBy.firstName} ${response.record.addedBy.lastName}`,
          addedByRole: response.record.addedByRole,
        }

        setRecords((prev) => [transformedRecord, ...prev])
        alert("Health record created successfully!")
      } else {
        // Patients can only upload documents, not create full records
        alert("As a patient, please use the Upload tab to add documents")
        return
      }

      setNewRecord({
        type: "",
        title: "",
        date: "",
        doctor: "",
        facility: "",
        notes: "",
        patientId: "",
      })
    } catch (error: any) {
      console.error("Error adding health record:", error)
      alert(`Error: ${error.message || "Failed to create record"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConsentRequest = async (patientId: string, accessType: string) => {
    setIsLoading(true)
    try {
      console.log("[v0] Requesting consent:", { patientId, accessType })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("[v0] Consent request sent successfully")
    } catch (error) {
      console.error("[v0] Error requesting consent:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareRecord = async (recordId: string, recipients: string[]) => {
    setIsLoading(true)
    try {
      await apiClient.updateRecordSharing(recordId, {
        isShared: true,
        consentRecipients: recipients
      })

      setRecords((prev) =>
        prev.map((record) =>
          record.id === recordId ? { ...record, isShared: true, consentRecipients: recipients } : record,
        ),
      )
      alert("Record shared successfully!")
    } catch (error: any) {
      console.error("Error sharing record:", error)
      alert(`Error: ${error.message || "Failed to share record"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()

      // Add files to form data
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })

      // Add optional metadata
      if (newRecord.type) formData.append('type', newRecord.type)
      if (newRecord.title) formData.append('title', newRecord.title)
      if (newRecord.date) formData.append('date', newRecord.date)
      if (newRecord.doctor) formData.append('doctor', newRecord.doctor)
      if (newRecord.facility) formData.append('facility', newRecord.facility)
      if (newRecord.notes) formData.append('notes', newRecord.notes)

      const response = await apiClient.uploadDocuments(formData)

      // Transform and add to records
      const transformedRecord: HealthRecord = {
        id: response.record._id,
        type: response.record.type,
        title: response.record.title,
        date: response.record.date,
        doctor: response.record.doctor,
        facility: response.record.facility,
        notes: response.record.notes || "",
        attachments: response.record.attachments.map(a => ({
          filename: a.filename,
          url: a.url,
          size: a.size
        })),
        consentRecipients: response.record.consentRecipients,
        isShared: response.record.isShared,
        blockchainHash: response.record.blockchainHash,
        hcsHash: response.record.hcsHash,
        hcsTopicId: response.record.hcsTopicId,
        ipfsCid: response.record.ipfsCid,
        ipfsUrl: response.record.ipfsUrl,
        nftData: response.record.nftData,
        patientId: response.record.patient._id,
        patientName: `${response.record.patient.firstName} ${response.record.patient.lastName}`,
        canEdit: response.record.canEdit,
        addedBy: `${response.record.addedBy.firstName} ${response.record.addedBy.lastName}`,
        addedByRole: response.record.addedByRole,
      }

      setRecords((prev) => [transformedRecord, ...prev])

      // Reset form
      setSelectedFiles([])
      setNewRecord({
        type: "",
        title: "",
        date: "",
        doctor: "",
        facility: "",
        notes: "",
        patientId: "",
      })

      alert("Documents uploaded successfully!")
    } catch (error: any) {
      console.error("Error uploading documents:", error)
      alert(`Error: ${error.message || "Failed to upload documents"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.patientName && record.patientName.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = filterType === "all" || record.type === filterType
    const matchesPatient = userRole === "patient" || !selectedPatient || record.patientId === selectedPatient
    return matchesSearch && matchesFilter && matchesPatient
  })

  const handleRecordUpdate = (field: string, value: any) => {
    setNewRecord((prev) => ({ ...prev, [field]: value }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const addMedicalNote = (recordId: string, note: string) => {
    console.log("[v0] Adding medical note to record:", recordId, note)
  }

  const requestConsent = (patientId: string, accessType: string) => {
    console.log("[v0] Requesting consent from patient:", patientId, accessType)
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">LifeChain™</h1>
            <p className="text-muted-foreground">Health Records Management</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          {userRole === "patient" && "Manage and share your health records securely on the blockchain"}
          {userRole === "doctor" && "Access patient records with consent and add medical notes"}
          {userRole === "ngo" && "View aggregated health data for program impact measurement"}
        </p>
      </div>

      <div className="max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${userRole === "patient" ? "grid-cols-4" : userRole === "doctor" ? "grid-cols-5" : "grid-cols-3"} mb-8`}
          >
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Records
            </TabsTrigger>
            {userRole === "patient" && (
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            )}
            {userRole === "doctor" && (
              <>
                <TabsTrigger value="add-notes" className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Add Notes
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Consent Requests
                </TabsTrigger>
              </>
            )}
            {userRole === "ngo" && (
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Program Analytics
              </TabsTrigger>
            )}
            <TabsTrigger value="consent" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {userRole === "patient" ? "Consent" : "Access Control"}
            </TabsTrigger>
          </TabsList>

          {/* Timeline View */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={
                    userRole === "patient" ? "Search records, doctors, or facilities..." : "Search patient records..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="lab-result">Lab Results</SelectItem>
                  <SelectItem value="prescription">Prescriptions</SelectItem>
                  <SelectItem value="diagnosis">Diagnoses</SelectItem>
                  <SelectItem value="vaccination">Vaccinations</SelectItem>
                  <SelectItem value="surgery">Surgeries</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredRecords.map((record, index) => {
                const IconComponent = recordTypeIcons[record.type]
                return (
                  <Card
                    key={record.id}
                    className="rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              record.type === "lab-result"
                                ? "bg-secondary/20"
                                : record.type === "prescription"
                                  ? "bg-primary/20"
                                  : record.type === "diagnosis"
                                    ? "bg-accent/20"
                                    : record.type === "vaccination"
                                      ? "bg-muted/20"
                                      : "bg-secondary/20"
                            }`}
                          >
                            <IconComponent
                              className={`w-6 h-6 ${
                                record.type === "lab-result"
                                  ? "text-secondary"
                                  : record.type === "prescription"
                                    ? "text-primary"
                                    : record.type === "diagnosis"
                                      ? "text-accent"
                                      : record.type === "vaccination"
                                        ? "text-muted-foreground"
                                        : "text-secondary"
                              }`}
                            />
                          </div>
                          {index < filteredRecords.length - 1 && (
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{record.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {record.doctor} • {record.facility}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {new Date(record.date).toLocaleDateString()}
                              </Badge>
                              {record.hcsHash && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-secondary/80"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(getHashScanUrl(record.hcsHash || ''), '_blank')
                                  }}
                                  title="Verified on Hedera - Click to view"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {record.nftData && record.nftData.transferred && (
                                <Badge
                                  variant="default"
                                  className="text-xs cursor-pointer hover:opacity-80 bg-gradient-to-r from-amber-500 to-amber-600"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    window.open(getNFTHashScanUrl(record.nftData?.nftId || ''), '_blank')
                                  }}
                                  title="NFT Certificate - Click to view on HashScan"
                                >
                                  <Award className="w-3 h-3 mr-1" />
                                  NFT
                                </Badge>
                              )}
                              {record.isShared && <Share2 className="w-4 h-4 text-secondary" />}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{record.notes}</p>
                          {userRole !== "patient" && record.patientName && (
                            <p className="text-xs text-muted-foreground mt-2">Patient: {record.patientName}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Records Grid View */}
          <TabsContent value="records" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => {
                const IconComponent = recordTypeIcons[record.type]
                return (
                  <Card
                    key={record.id}
                    className="rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            record.type === "lab-result"
                              ? "bg-secondary/20"
                              : record.type === "prescription"
                                ? "bg-primary/20"
                                : record.type === "diagnosis"
                                  ? "bg-accent/20"
                                  : record.type === "vaccination"
                                    ? "bg-muted/20"
                                    : "bg-secondary/20"
                          }`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              record.type === "lab-result"
                                ? "text-secondary"
                                : record.type === "prescription"
                                  ? "text-primary"
                                  : record.type === "diagnosis"
                                    ? "text-accent"
                                    : record.type === "vaccination"
                                      ? "text-muted-foreground"
                                      : "text-secondary"
                            }`}
                          />
                        </div>
                        {record.isShared && <Share2 className="w-4 h-4 text-secondary" />}
                      </div>
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {record.doctor} • {new Date(record.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{record.notes}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Upload Tab - Different UI for Patients vs Doctors/NGOs */}
          {userRole === "patient" && (
            <TabsContent value="upload" className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload Health Documents
                  </CardTitle>
                  <CardDescription>Upload medical documents, lab results, prescriptions, etc.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> As a patient, you can upload health documents. For creating complete medical records, please consult with your healthcare provider.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recordType">Document Type (Optional)</Label>
                      <Select value={newRecord.type} onValueChange={(value) => handleRecordUpdate("type", value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lab-result">Lab Result</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="diagnosis">Diagnosis</SelectItem>
                          <SelectItem value="vaccination">Vaccination</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordTitle">Title (Optional)</Label>
                      <Input
                        id="recordTitle"
                        value={newRecord.title}
                        onChange={(e) => handleRecordUpdate("title", e.target.value)}
                        placeholder="e.g., Blood Test Results"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newRecord.notes}
                      onChange={(e) => handleRecordUpdate("notes", e.target.value)}
                      placeholder="Add any notes about these documents"
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>

                  <div className="border-2 border-dashed border-muted rounded-2xl p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium mb-2">Upload Documents (Required)</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Images (JPG, PNG) or PDF files only. Max 10MB per file.
                    </p>
                    <input
                      type="file"
                      id="fileInput"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      Choose Files
                    </Button>
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Selected Files:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-xl">
                            <span className="text-xs">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleFileUpload}
                    disabled={isLoading || selectedFiles.length === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    {isLoading ? "Uploading..." : "Upload to LifeChain"}
                    <Plus className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Create Record Tab for Doctors/NGOs */}
          {(userRole === "doctor" || userRole === "ngo") && (
            <TabsContent value="upload" className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    Create Patient Health Record
                  </CardTitle>
                  <CardDescription>Create a complete medical record for a patient</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      <strong>Healthcare Provider:</strong> You can create complete medical records with full details.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID (Required)</Label>
                    <Input
                      id="patientId"
                      value={newRecord.patientId}
                      onChange={(e) => handleRecordUpdate("patientId", e.target.value)}
                      placeholder="Enter patient's ID"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recordType">Record Type (Required)</Label>
                      <Select value={newRecord.type} onValueChange={(value) => handleRecordUpdate("type", value)}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lab-result">Lab Result</SelectItem>
                          <SelectItem value="prescription">Prescription</SelectItem>
                          <SelectItem value="diagnosis">Diagnosis</SelectItem>
                          <SelectItem value="vaccination">Vaccination</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recordTitle">Title (Required)</Label>
                      <Input
                        id="recordTitle"
                        value={newRecord.title}
                        onChange={(e) => handleRecordUpdate("title", e.target.value)}
                        placeholder="Enter record title"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recordDate">Date (Required)</Label>
                      <Input
                        id="recordDate"
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => handleRecordUpdate("date", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Doctor/Provider</Label>
                      <Input
                        id="doctor"
                        value={newRecord.doctor}
                        onChange={(e) => handleRecordUpdate("doctor", e.target.value)}
                        placeholder="Enter doctor or provider name"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facility">Facility/Hospital</Label>
                    <Input
                      id="facility"
                      value={newRecord.facility}
                      onChange={(e) => handleRecordUpdate("facility", e.target.value)}
                      placeholder="Enter facility or hospital name"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Clinical Notes/Details</Label>
                    <Textarea
                      id="notes"
                      value={newRecord.notes}
                      onChange={(e) => handleRecordUpdate("notes", e.target.value)}
                      placeholder="Enter clinical notes, diagnosis, treatment plan, etc."
                      className="rounded-xl min-h-[120px]"
                    />
                  </div>

                  <div className="border-2 border-dashed border-muted rounded-2xl p-8 text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium mb-2">Attachments (Optional)</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Upload supporting documents - Images or PDF files. Max 10MB per file.
                    </p>
                    <input
                      type="file"
                      id="fileInputDoctor"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      onClick={() => document.getElementById('fileInputDoctor')?.click()}
                    >
                      Choose Files
                    </Button>
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium">Selected Files:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-xl">
                            <span className="text-xs">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitRecord}
                      disabled={isLoading || !newRecord.type || !newRecord.title || !newRecord.date || !newRecord.patientId}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    >
                      {isLoading ? "Creating..." : "Create Health Record"}
                      <Plus className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={() => fillTestRecordData()}
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      disabled={!newRecord.type}
                    >
                      Fill Test Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* NGO Analytics Tab */}
          {userRole === "ngo" && (
            <TabsContent value="analytics" className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Program Health Analytics
                  </CardTitle>
                  <CardDescription>Aggregated health data from program participants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="rounded-xl bg-primary/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">1,247</p>
                        <p className="text-sm text-muted-foreground">Total Participants</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-xl bg-secondary/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-secondary">89%</p>
                        <p className="text-sm text-muted-foreground">Vaccination Rate</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-xl bg-accent/10">
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-accent">156</p>
                        <p className="text-sm text-muted-foreground">Health Screenings</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Program Impact Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-sm">Malaria Prevention Program</span>
                        <Badge variant="secondary">92% Coverage</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-sm">Maternal Health Initiative</span>
                        <Badge variant="secondary">78% Participation</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                        <span className="text-sm">Child Nutrition Program</span>
                        <Badge variant="secondary">85% Improvement</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-secondary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Privacy Protected</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All participant data is anonymized and aggregated. Individual records are not accessible.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Consent Management */}
          <TabsContent value="consent" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {userRole === "patient" ? "Consent Management" : "Access Control"}
                </CardTitle>
                <CardDescription>
                  {userRole === "patient"
                    ? "Manage who can access your health records"
                    : "View your access permissions to patient records"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRole === "patient" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">Dr. Michael Adebayo</p>
                        <p className="text-xs text-muted-foreground">Cardiologist • Heart Care Clinic</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Full Access</Badge>
                        <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">City Insurance Co.</p>
                        <p className="text-xs text-muted-foreground">Insurance Provider</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Limited Access</Badge>
                        <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="font-medium text-sm">John Doe</p>
                        <p className="text-xs text-muted-foreground">Patient ID: PAT-001</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Consented</Badge>
                        <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = recordTypeIcons[selectedRecord.type]
                    return <IconComponent className="w-5 h-5 text-primary" />
                  })()}
                  {selectedRecord.title}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                {selectedRecord.doctor} • {selectedRecord.facility} •{" "}
                {new Date(selectedRecord.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRecord.notes}</p>
              </div>

              {selectedRecord.hcsHash && (
                <div>
                  <Label className="text-sm font-medium">Hedera HCS Transaction</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded flex-1 truncate">{selectedRecord.hcsHash}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getHashScanUrl(selectedRecord.hcsHash || ''), '_blank')}
                      className="rounded-xl"
                      title="View on HashScan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedRecord.hcsHash || "")}
                      className="rounded-xl"
                      title="Copy transaction ID"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedRecord.ipfsCid && (
                <div>
                  <Label className="text-sm font-medium">IPFS CID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted/50 px-2 py-1 rounded flex-1 truncate">{selectedRecord.ipfsCid}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedRecord.ipfsUrl) {
                          window.open(selectedRecord.ipfsUrl, '_blank')
                        }
                      }}
                      className="rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {selectedRecord.nftData && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium text-amber-900 dark:text-amber-100">NFT Vaccination Certificate</Label>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        This vaccination record has been minted as an NFT and {selectedRecord.nftData.transferred ? 'transferred to your Hedera account' : 'is stored in the platform treasury'}.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">NFT ID:</span>
                      <code className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded">{selectedRecord.nftData.nftId}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Serial Number:</span>
                      <span className="font-medium">#{selectedRecord.nftData.serial}</span>
                    </div>
                    {selectedRecord.nftData.ownerAccountId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Owner Account:</span>
                        <code className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded">{selectedRecord.nftData.ownerAccountId}</code>
                      </div>
                    )}
                    {selectedRecord.nftData.funded && (
                      <div className="flex items-center gap-2 mt-2 p-2 bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 dark:text-green-200 text-xs">Your account was funded with 10 HBAR for NFT operations</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getNFTHashScanUrl(selectedRecord.nftData?.nftId || ''), '_blank')}
                      className="flex-1 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View NFT on HashScan
                    </Button>
                    {selectedRecord.nftData.transferTransactionId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(getHashScanUrl(selectedRecord.nftData?.transferTransactionId || ''), '_blank')}
                        className="flex-1 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/30"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Transfer Transaction
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedRecord.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments</Label>
                  <div className="space-y-2 mt-1">
                    {selectedRecord.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-xl">
                        <div className="flex-1">
                          <span className="text-sm font-medium">{attachment.filename}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl bg-transparent"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl bg-transparent"
                  onClick={() => handleShareRecord(selectedRecord.id, [])}
                  disabled={isLoading}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isLoading ? "Sharing..." : "Share"}
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
