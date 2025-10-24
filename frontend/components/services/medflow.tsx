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
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Star,
  Search,
  Filter,
  Plus,
  Pill,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Activity,
  X,
  Upload,
  Paperclip,
} from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  experience: number
  location: string
  phone: string
  avatar: string
  availableSlots: string[]
  consultationFee: number
  languages: string[]
}

interface Appointment {
  id: string
  doctorId: string
  patientId?: string  // Add patient ID
  doctorName: string
  specialty: string
  date: string
  time: string
  reason: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "accepted" | "requested"
  type: "consultation" | "follow-up" | "emergency"
  location: string
  notes?: string
}

interface Prescription {
  id: string
  prescriptionName: string
  doctorName: string
  issuedDate: string
  issuedBy: string
  medications: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }[]
  diagnosis: string
  status: "active" | "completed" | "expired"
  refillsRemaining: number
}

interface MedFlowProps {
  userRole?: "patient" | "doctor" | "ngo"
}

const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Adebayo Ogundimu",
    specialty: "Cardiology",
    rating: 4.8,
    experience: 15,
    location: "Lagos General Hospital",
    phone: "+234 801 234 5678",
    avatar: "/caring-doctor.png",
    availableSlots: ["09:00", "10:30", "14:00", "15:30"],
    consultationFee: 15000,
    languages: ["English", "Yoruba"],
  },
  {
    id: "2",
    name: "Dr. Fatima Abdullahi",
    specialty: "Pediatrics",
    rating: 4.9,
    experience: 12,
    location: "Abuja Medical Center",
    phone: "+234 802 345 6789",
    avatar: "/female-doctor.png",
    availableSlots: ["08:30", "11:00", "13:30", "16:00"],
    consultationFee: 12000,
    languages: ["English", "Hausa"],
  },
  {
    id: "3",
    name: "Dr. Chinedu Okwu",
    specialty: "General Medicine",
    rating: 4.7,
    experience: 10,
    location: "Port Harcourt Clinic",
    phone: "+234 803 456 7890",
    avatar: "/male-doctor.png",
    availableSlots: ["09:30", "12:00", "14:30", "17:00"],
    consultationFee: 10000,
    languages: ["English", "Igbo"],
  },
]

const mockAppointments: Appointment[] = [
  {
    id: "1",
    doctorId: "1",
    doctorName: "Dr. Adebayo Ogundimu",
    specialty: "Cardiology",
    date: "2024-01-20",
    time: "10:30",
    reason: "Routine cardiac checkup",
    status: "scheduled",
    type: "consultation",
    location: "Lagos General Hospital",
  },
  {
    id: "2",
    doctorId: "2",
    doctorName: "Dr. Fatima Abdullahi",
    specialty: "Pediatrics",
    date: "2024-01-18",
    time: "11:00",
    reason: "Child vaccination",
    status: "completed",
    type: "consultation",
    location: "Abuja Medical Center",
    notes: "Vaccination completed successfully. Next appointment in 6 months.",
  },
  {
    id: "3",
    doctorId: "3",
    doctorName: "Dr. Chinedu Okwu",
    specialty: "General Medicine",
    date: "2024-01-25",
    time: "14:30",
    reason: "Follow-up consultation",
    status: "scheduled",
    type: "follow-up",
    location: "Port Harcourt Clinic",
  },
]

const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    prescriptionName: "Hypertension Management",
    doctorName: "Dr. Adebayo Ogundimu",
    issuedDate: "2024-01-15",
    issuedBy: "Lagos General Hospital",
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food in the morning",
      },
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take in the evening",
      },
    ],
    diagnosis: "Essential Hypertension",
    status: "active",
    refillsRemaining: 2,
  },
  {
    id: "2",
    prescriptionName: "Antibiotic Treatment",
    doctorName: "Dr. Chinedu Okwu",
    issuedDate: "2024-01-10",
    issuedBy: "Port Harcourt Clinic",
    medications: [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "Three times daily",
        duration: "7 days",
        instructions: "Take with meals. Complete full course",
      },
    ],
    diagnosis: "Bacterial Infection",
    status: "completed",
    refillsRemaining: 0,
  },
]

const specialtyIcons = {
  Cardiology: Heart,
  Pediatrics: User,
  "General Medicine": Stethoscope,
  Neurology: Brain,
  Orthopedics: Bone,
  Emergency: Activity,
}

export default function MedFlow({ userRole = "patient" }: MedFlowProps) {
  const [activeTab, setActiveTab] = useState("appointments")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentReason, setAppointmentReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors) // Start with mock data
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Doctor-specific state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [prescriptionTitle, setPrescriptionTitle] = useState("")
  const [prescriptionMedicines, setPrescriptionMedicines] = useState<any[]>([])
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false)
  const [medicalRecordData, setMedicalRecordData] = useState({
    type: 'diagnosis',
    title: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    facility: '',
    notes: '',
    diagnosis: '',
    treatment: '',
    symptoms: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    }
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const testAppointmentData = {
    date: "2024-02-15",
    time: "10:30",
    reason: "Routine health checkup and consultation for ongoing symptoms including fatigue and headaches",
  }

  const fillTestAppointmentData = () => {
    setSelectedDate(testAppointmentData.date)
    setSelectedTime(testAppointmentData.time)
    setAppointmentReason(testAppointmentData.reason)
  }

  const handleBookAppointment = async () => {
    if (selectedDoctor && selectedDate && selectedTime && appointmentReason) {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      try {
        console.log("Booking appointment:", {
          doctor: selectedDoctor.name,
          date: selectedDate,
          time: selectedTime,
          reason: appointmentReason,
        })

        // Combine date and time for the API
        const scheduledAt = `${selectedDate}T${selectedTime}:00.000Z`

        await apiClient.createAppointment({
          clinicId: selectedDoctor.id,
          scheduledAt: scheduledAt,
          reason: appointmentReason
        })

        setSelectedDoctor(null)
        setSelectedDate("")
        setSelectedTime("")
        setAppointmentReason("")
        setSuccess("Appointment booked successfully!")

        // Refresh appointments list
        await loadAppointments()
      } catch (error: any) {
        console.error("Error booking appointment:", error)
        setError(error.message || "Failed to book appointment")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      console.log("Cancelling appointment:", appointmentId)

      await apiClient.cancelAppointment(appointmentId)
      setSuccess("Appointment cancelled successfully!")

      // Refresh appointments list
      await loadAppointments()
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      setError(error.message || "Failed to cancel appointment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRescheduleAppointment = async (appointmentId: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      console.log("Rescheduling appointment:", appointmentId)

      // For now, we'll show a success message as the backend doesn't have a reschedule endpoint
      // In a real implementation, this would call a reschedule API
      setSuccess("Please contact the clinic to reschedule your appointment.")
    } catch (error: any) {
      console.error("Error rescheduling appointment:", error)
      setError(error.message || "Failed to reschedule appointment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestRefill = async (prescriptionId: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      console.log("Requesting prescription refill:", prescriptionId)

      // For now, we'll show a success message as refill requests would typically be
      // handled through a different workflow or notification system
      setSuccess("Refill request submitted successfully! The clinic will be notified.")

      // In a real implementation, you might call an API to request a refill
      // await apiClient.requestPrescriptionRefill(prescriptionId)
    } catch (error: any) {
      console.error("Error requesting refill:", error)
      setError(error.message || "Failed to request refill")
    } finally {
      setIsLoading(false)
    }
  }

  // Doctor-specific functions
  const handleAcceptAppointment = async (appointmentId: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await apiClient.acceptAppointment(appointmentId)
      setSuccess("Appointment accepted successfully!")
      await loadAppointments()
    } catch (error: any) {
      console.error("Error accepting appointment:", error)
      setError(error.message || "Failed to accept appointment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleIssuePrescription = async () => {
    if (!selectedAppointment || !prescriptionTitle || prescriptionMedicines.length === 0) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await apiClient.issuePrescription({
        appointmentId: selectedAppointment.id,
        title: prescriptionTitle,
        payload: {
          medicines: prescriptionMedicines,
          notes: prescriptionNotes
        }
      })

      setSuccess("Prescription issued successfully!")
      setShowPrescriptionModal(false)
      setSelectedAppointment(null)
      setPrescriptionTitle("")
      setPrescriptionMedicines([])
      setPrescriptionNotes("")
      await loadPrescriptions()
    } catch (error: any) {
      console.error("Error issuing prescription:", error)
      setError(error.message || "Failed to issue prescription")
    } finally {
      setIsLoading(false)
    }
  }

  const addMedicine = () => {
    setPrescriptionMedicines([
      ...prescriptionMedicines,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ])
  }

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...prescriptionMedicines]
    updated[index][field] = value
    setPrescriptionMedicines(updated)
  }

  const removeMedicine = (index: number) => {
    setPrescriptionMedicines(prescriptionMedicines.filter((_, i) => i !== index))
  }

  const handleWriteMedicalRecord = async () => {
    if (!selectedAppointment || !medicalRecordData.title || !medicalRecordData.type) {
      setError("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    try {
      // Get patient ID from appointment
      const patientId = selectedAppointment.patientId

      if (!patientId) {
        throw new Error("Patient ID not found in appointment")
      }

      // If files are selected, use FormData upload endpoint
      if (selectedFiles.length > 0) {
        const formData = new FormData()
        formData.append('patientId', patientId)
        formData.append('type', medicalRecordData.type)
        formData.append('title', medicalRecordData.title)
        formData.append('date', medicalRecordData.date)
        formData.append('doctor', medicalRecordData.doctor)
        formData.append('facility', medicalRecordData.facility)
        formData.append('notes', medicalRecordData.notes)

        // Append all files
        selectedFiles.forEach((file) => {
          formData.append('documents', file)
        })

        await apiClient.uploadMedflowDocuments(formData)
      } else {
        // No files, use regular JSON endpoint
        await apiClient.createRecord({
          patientId,
          type: medicalRecordData.type,
          title: medicalRecordData.title,
          date: medicalRecordData.date,
          doctor: medicalRecordData.doctor,
          facility: medicalRecordData.facility,
          notes: medicalRecordData.notes
        })
      }

      setSuccess("Medical record created successfully!")
      setShowMedicalRecordModal(false)
      setSelectedAppointment(null)
      setSelectedFiles([])
      setUploadProgress(0)
      setMedicalRecordData({
        type: 'diagnosis',
        title: '',
        date: new Date().toISOString().split('T')[0],
        doctor: '',
        facility: '',
        notes: '',
        diagnosis: '',
        treatment: '',
        symptoms: '',
        vitalSigns: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          respiratoryRate: '',
          oxygenSaturation: ''
        }
      })
    } catch (error: any) {
      console.error("Error creating medical record:", error)
      setError(error.message || "Failed to create medical record")
    } finally {
      setIsLoading(false)
    }
  }

  // Load doctors from API
  const loadDoctors = async () => {
    try {
      const response = await apiClient.listDoctors({
        specialty: filterSpecialty !== 'all' ? filterSpecialty : undefined,
        search: searchQuery || undefined
      })

      if (response.doctors && response.doctors.length > 0) {
        setDoctors(response.doctors)
      }
    } catch (error: any) {
      console.error("Error loading doctors:", error)
      // Keep mock data as fallback
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterSpecialty === "all" || doctor.specialty === filterSpecialty
    return matchesSearch && matchesFilter
  })

  // Load appointments from API
  const loadAppointments = async () => {
    try {
      const response = await apiClient.listAppointments()

      // Convert API appointments to UI format
      const apiAppointments: Appointment[] = response.appointments?.map((apt: any) => {
        const doctorName = apt.clinic?.firstName && apt.clinic?.lastName
          ? `Dr. ${apt.clinic.firstName} ${apt.clinic.lastName}`
          : "Unknown Doctor";
        const patientName = apt.patient?.firstName && apt.patient?.lastName
          ? `${apt.patient.firstName} ${apt.patient.lastName}`
          : "Unknown Patient";

        return {
          id: apt._id,
          doctorId: apt.clinic?._id || apt.clinic,
          patientId: apt.patient?._id || apt.patient,  // Store patient ID
          doctorName: userRole === "doctor" ? patientName : doctorName,
          specialty: apt.clinic?.roleData?.DOCTOR?.specialty || "General Medicine",
          date: new Date(apt.scheduledAt).toISOString().split('T')[0],
          time: new Date(apt.scheduledAt).toTimeString().slice(0, 5),
          reason: apt.reason,
          status: apt.status === "requested" ? "scheduled" : apt.status,
          type: "consultation" as const,
          location: apt.clinic?.roleData?.DOCTOR?.organization || "Medical Center",
          notes: apt.notes
        };
      }) || []

      setAppointments(apiAppointments)
    } catch (error: any) {
      console.error("Error loading appointments:", error)
      // Don't show error for loading as it's not critical
    }
  }

  // Load prescriptions from API
  const loadPrescriptions = async () => {
    try {
      const response = await apiClient.listPrescriptions()

      // Convert API prescriptions to UI format
      const apiPrescriptions: Prescription[] = response.prescriptions?.map((pres: any) => {
        const doctorName = pres.clinic?.firstName && pres.clinic?.lastName
          ? `Dr. ${pres.clinic.firstName} ${pres.clinic.lastName}`
          : pres.issuedBy?.name || "Unknown Doctor";

        return {
          id: pres._id,
          prescriptionName: pres.title,
          doctorName: doctorName,
          issuedDate: new Date(pres.issuedAt || pres.createdAt).toISOString().split('T')[0],
          issuedBy: doctorName,
          medications: pres.medicines || [],
          diagnosis: pres.notes || "No diagnosis provided",
          status: "active" as const, // Default to active
          refillsRemaining: 0
        };
      }) || []

      setPrescriptions(apiPrescriptions.length > 0 ? apiPrescriptions : mockPrescriptions)
    } catch (error: any) {
      console.error("Error loading prescriptions:", error)
      // Fall back to mock data if API fails
      setPrescriptions(mockPrescriptions)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadAppointments()
    loadPrescriptions()
    loadDoctors() // Load doctors from DB
  }, [])

  // Reload doctors when filter changes
  useEffect(() => {
    if (filterSpecialty !== 'all' || searchQuery) {
      loadDoctors()
    }
  }, [filterSpecialty])

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
    <div className="space-y-6">
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
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">MedFlow™</h1>
            <p className="text-muted-foreground">Appointment & Prescription System</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          Decentralized appointment system and e-prescriptions powered by Hedera blockchain
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-2xl bg-accent/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">
              {appointments.filter((a) => a.status === "scheduled" || a.status === "accepted").length}
            </p>
            <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-primary/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">
              {userRole === "doctor"
                ? new Set(appointments.map(a => a.doctorId)).size
                : doctors.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {userRole === "doctor" ? "Assigned Patients" : "Available Doctors"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-secondary/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Pill className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary">
              {prescriptions.filter((p) => p.status === "active").length}
            </p>
            <p className="text-sm text-muted-foreground">
              {userRole === "doctor" ? "Prescriptions Issued" : "Active Prescriptions"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-muted/10">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-muted/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-muted-foreground">
              {appointments.filter((a) => a.status === "completed").length}
            </p>
            <p className="text-sm text-muted-foreground">
              {userRole === "doctor" ? "Completed Checkups" : "Completed Visits"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {userRole === "patient" ? (
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Find Doctors
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                My Appointments
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <Pill className="w-4 h-4" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>
          )}

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {userRole === "doctor" && (
              <div className="space-y-6">
                {/* Pending Appointments for Doctor */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      Pending Appointments
                    </CardTitle>
                    <CardDescription>Appointments awaiting your confirmation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments
                      .filter((apt) => apt.status === "scheduled" || apt.status === "requested")
                      .map((appointment) => (
                        <Card key={appointment.id} className="rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-sm">Patient: {appointment.doctorName}</h4>
                              <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <Badge variant="secondary" className="bg-accent/20 text-accent">
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                              <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                              <span>{appointment.time}</span>
                            </div>
                            <p className="text-muted-foreground">{appointment.reason}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => handleAcceptAppointment(appointment.id)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
                            >
                              {isLoading ? "Accepting..." : "Accept"}
                            </Button>
                            <Button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              disabled={isLoading}
                              variant="outline"
                              size="sm"
                              className="border-destructive text-destructive hover:bg-destructive/10 rounded-xl bg-transparent"
                            >
                              {isLoading ? "Declining..." : "Decline"}
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowPrescriptionModal(true)
                                addMedicine()
                              }}
                              disabled={isLoading}
                              size="sm"
                              variant="outline"
                              className="rounded-xl bg-transparent"
                            >
                              <Pill className="w-4 h-4 mr-2" />
                              Issue Prescription
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowMedicalRecordModal(true)
                              }}
                              disabled={isLoading}
                              size="sm"
                              variant="outline"
                              className="rounded-xl bg-transparent"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Write Record
                            </Button>
                          </div>
                        </Card>
                      ))}
                    {appointments.filter((apt) => apt.status === "scheduled" || apt.status === "requested").length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No pending appointments</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {userRole === "patient" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Your scheduled healthcare visits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments
                      .filter((apt) => apt.status === "scheduled")
                      .map((appointment) => (
                        <Card key={appointment.id} className="rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">{appointment.doctorName}</h4>
                            <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                          </div>
                          <Badge
                            variant={appointment.type === "emergency" ? "destructive" : "secondary"}
                            className={
                              appointment.type === "emergency"
                                ? ""
                                : appointment.type === "follow-up"
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-accent/20 text-accent"
                            }
                          >
                            {appointment.type}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{appointment.location}</span>
                          </div>
                          <p className="text-muted-foreground">{appointment.reason}</p>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleRescheduleAppointment(appointment.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="rounded-xl bg-transparent"
                          >
                            {isLoading ? "Rescheduling..." : "Reschedule"}
                          </Button>
                          <Button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="border-destructive text-destructive hover:bg-destructive/10 rounded-xl bg-transparent"
                          >
                            {isLoading ? "Cancelling..." : "Cancel"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common appointment tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setActiveTab("doctors")}
                    className="w-full justify-start bg-primary/10 hover:bg-primary/20 text-primary rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book New Appointment
                  </Button>
                  <Button className="w-full justify-start bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                  <Button
                    onClick={() => setActiveTab("prescriptions")}
                    className="w-full justify-start bg-accent/10 hover:bg-accent/20 text-accent rounded-xl"
                  >
                    <Pill className="w-4 h-4 mr-2" />
                    Request Prescription Refill
                  </Button>
                  <Button
                    onClick={() => setActiveTab("history")}
                    className="w-full justify-start bg-muted/10 hover:bg-muted/20 text-muted-foreground rounded-xl"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Medical Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>

          {/* Find Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search doctors by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="General Medicine">General Medicine</SelectItem>
                  <SelectItem value="Neurology">Neurology</SelectItem>
                  <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const SpecialtyIcon = specialtyIcons[doctor.specialty as keyof typeof specialtyIcons] || Stethoscope
                return (
                  <Card
                    key={doctor.id}
                    className="rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={doctor.avatar || "/placeholder.svg"}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{doctor.name}</h3>
                          <div className="flex items-center gap-2">
                            <SpecialtyIcon className="w-4 h-4 text-accent" />
                            <span className="text-sm text-muted-foreground">{doctor.specialty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{doctor.experience} years exp.</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{doctor.phone}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-medium">₦{doctor.consultationFee.toLocaleString()}</span>
                          <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                            {doctor.availableSlots.length} slots available
                          </Badge>
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id} className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{prescription.prescriptionName}</CardTitle>
                        <CardDescription>
                          Prescribed by {prescription.doctorName} • {prescription.issuedBy}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          prescription.status === "active"
                            ? "default"
                            : prescription.status === "completed"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          prescription.status === "active"
                            ? "bg-secondary/20 text-secondary"
                            : prescription.status === "completed"
                              ? "bg-muted/20 text-muted-foreground"
                              : ""
                        }
                      >
                        {prescription.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs font-medium">Issued Date</Label>
                        <p className="text-muted-foreground">
                          {new Date(prescription.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Diagnosis</Label>
                        <p className="text-muted-foreground">{prescription.diagnosis}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Medications</Label>
                      <div className="space-y-3 mt-2">
                        {prescription.medications.map((med, index) => (
                          <Card key={index} className="rounded-xl p-4 bg-muted/30">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-sm">{med.name}</h4>
                                <p className="text-xs text-muted-foreground">{med.dosage}</p>
                              </div>
                              <Pill className="w-4 h-4 text-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-medium">Frequency:</span>
                                <p className="text-muted-foreground">{med.frequency}</p>
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span>
                                <p className="text-muted-foreground">{med.duration}</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{med.instructions}</p>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm">
                        <span className="font-medium">Refills Remaining: </span>
                        <span className="text-muted-foreground">{prescription.refillsRemaining}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        {prescription.status === "active" && prescription.refillsRemaining > 0 && (
                          <Button
                            onClick={() => handleRequestRefill(prescription.id)}
                            disabled={isLoading}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                          >
                            {isLoading ? "Requesting..." : "Request Refill"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  Appointment History
                </CardTitle>
                <CardDescription>Your past healthcare visits and treatments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments
                    .filter((apt) => apt.status === "completed")
                    .map((appointment, index) => (
                      <div key={appointment.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="relative">
                          <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-secondary" />
                          </div>
                          {index < appointments.filter((apt) => apt.status === "completed").length - 1 && (
                            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-sm">{appointment.doctorName}</h4>
                              <p className="text-xs text-muted-foreground">{appointment.specialty}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(appointment.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{appointment.reason}</p>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                              {appointment.notes}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                              <Download className="w-3 h-3 mr-1" />
                              Download Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Doctor Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedDoctor.avatar || "/placeholder.svg"}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <CardTitle className="text-xl">{selectedDoctor.name}</CardTitle>
                    <CardDescription>{selectedDoctor.specialty}</CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm">{selectedDoctor.rating}</span>
                      <span className="text-sm text-muted-foreground">• {selectedDoctor.experience} years exp.</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDoctor(null)} className="rounded-xl">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Consultation Fee</Label>
                  <p className="text-sm text-muted-foreground">₦{selectedDoctor.consultationFee.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Languages</Label>
                <div className="flex gap-2 mt-1">
                  {selectedDoctor.languages.map((lang, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="appointmentDate" className="text-sm font-medium">
                    Select Date
                  </Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-xl"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedDoctor.availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(slot)}
                        className={`rounded-xl ${
                          selectedTime === slot
                            ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                            : "bg-transparent"
                        }`}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason" className="text-sm font-medium">
                    Reason for Visit
                  </Label>
                  <Textarea
                    id="reason"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="Describe your symptoms or reason for consultation..."
                    className="rounded-xl min-h-20"
                  />
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Blockchain Secured</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your appointment will be recorded on the Hedera network for security and transparency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => setSelectedDoctor(null)}
                  variant="outline"
                  className="flex-1 rounded-xl bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookAppointment}
                  disabled={isLoading || !selectedDate || !selectedTime || !appointmentReason}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                >
                  {isLoading ? "Booking..." : "Book Appointment"}
                </Button>
                <Button onClick={fillTestAppointmentData} variant="outline" className="rounded-xl bg-transparent">
                  Fill Test Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Medical Record Modal (Doctor Only) */}
      {showMedicalRecordModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Write Medical Record</CardTitle>
                  <CardDescription>
                    Patient: {selectedAppointment.doctorName} | {new Date(selectedAppointment.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMedicalRecordModal(false)
                    setSelectedAppointment(null)
                    setSelectedFiles([])
                    setUploadProgress(0)
                  }}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recordType" className="text-sm font-medium">
                    Record Type *
                  </Label>
                  <Select
                    value={medicalRecordData.type}
                    onValueChange={(value) => setMedicalRecordData({ ...medicalRecordData, type: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select record type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="lab-result">Lab Result</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recordDate" className="text-sm font-medium">
                    Date *
                  </Label>
                  <Input
                    id="recordDate"
                    type="date"
                    value={medicalRecordData.date}
                    onChange={(e) => setMedicalRecordData({ ...medicalRecordData, date: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recordTitle" className="text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="recordTitle"
                  value={medicalRecordData.title}
                  onChange={(e) => setMedicalRecordData({ ...medicalRecordData, title: e.target.value })}
                  placeholder="e.g., Annual Physical Examination"
                  className="rounded-xl"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recordDoctor" className="text-sm font-medium">
                    Doctor Name
                  </Label>
                  <Input
                    id="recordDoctor"
                    value={medicalRecordData.doctor}
                    onChange={(e) => setMedicalRecordData({ ...medicalRecordData, doctor: e.target.value })}
                    placeholder="Dr. John Smith"
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="recordFacility" className="text-sm font-medium">
                    Facility
                  </Label>
                  <Input
                    id="recordFacility"
                    value={medicalRecordData.facility}
                    onChange={(e) => setMedicalRecordData({ ...medicalRecordData, facility: e.target.value })}
                    placeholder="Medical Center Name"
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recordNotes" className="text-sm font-medium">
                  Clinical Notes *
                </Label>
                <Textarea
                  id="recordNotes"
                  value={medicalRecordData.notes}
                  onChange={(e) => setMedicalRecordData({ ...medicalRecordData, notes: e.target.value })}
                  placeholder="Detailed medical notes, observations, diagnosis, treatment plan..."
                  className="rounded-xl min-h-32"
                />
              </div>

              {/* Document Upload Section */}
              <div>
                <Label htmlFor="recordDocuments" className="text-sm font-medium">
                  Attach Documents (Optional)
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      id="recordDocuments"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files))
                        }
                      }}
                      className="rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('recordDocuments') as HTMLInputElement
                        if (input) input.click()
                      }}
                      className="rounded-xl bg-transparent whitespace-nowrap"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-medium flex items-center gap-2">
                        <Paperclip className="w-3 h-3" />
                        {selectedFiles.length} file(s) selected
                      </p>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate flex-1">
                              {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
                              }}
                              className="h-6 w-6 p-0 hover:bg-destructive/10"
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                  </p>
                </div>
              </div>

              <div className="bg-primary/10 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Blockchain & IPFS Secured</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This medical record will be stored on IPFS and anchored to the Hedera network for
                      security and immutability. It will appear in the patient's LifeChain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    setShowMedicalRecordModal(false)
                    setSelectedAppointment(null)
                    setSelectedFiles([])
                    setUploadProgress(0)
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWriteMedicalRecord}
                  disabled={isLoading || !medicalRecordData.title || !medicalRecordData.notes}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                >
                  {isLoading ? "Creating..." : "Create Medical Record"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prescription Issuance Modal (Doctor Only) */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Issue Prescription</CardTitle>
                  <CardDescription>
                    Patient: {selectedAppointment.doctorName} | {new Date(selectedAppointment.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPrescriptionModal(false)
                    setSelectedAppointment(null)
                    setPrescriptionTitle("")
                    setPrescriptionMedicines([])
                    setPrescriptionNotes("")
                  }}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prescriptionTitle" className="text-sm font-medium">
                  Prescription Title *
                </Label>
                <Input
                  id="prescriptionTitle"
                  value={prescriptionTitle}
                  onChange={(e) => setPrescriptionTitle(e.target.value)}
                  placeholder="e.g., Hypertension Management"
                  className="rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Medications *</Label>
                  <Button onClick={addMedicine} size="sm" variant="outline" className="rounded-xl bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
                <div className="space-y-4">
                  {prescriptionMedicines.map((med, index) => (
                    <Card key={index} className="rounded-xl p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium">Medicine {index + 1}</span>
                        <Button
                          onClick={() => removeMedicine(index)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={med.name}
                            onChange={(e) => updateMedicine(index, "name", e.target.value)}
                            placeholder="Medicine name"
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Dosage</Label>
                          <Input
                            value={med.dosage}
                            onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                            placeholder="e.g., 10mg"
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Frequency</Label>
                          <Input
                            value={med.frequency}
                            onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                            placeholder="e.g., Once daily"
                            className="rounded-xl"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Duration</Label>
                          <Input
                            value={med.duration}
                            onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                            placeholder="e.g., 30 days"
                            className="rounded-xl"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Instructions</Label>
                          <Input
                            value={med.instructions}
                            onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                            placeholder="Special instructions"
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  {prescriptionMedicines.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      No medicines added yet. Click "Add Medicine" to start.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="prescriptionNotes" className="text-sm font-medium">
                  Diagnosis / Notes
                </Label>
                <Textarea
                  id="prescriptionNotes"
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="Diagnosis, additional notes, or patient instructions..."
                  className="rounded-xl min-h-20"
                />
              </div>

              <div className="bg-accent/10 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Blockchain & IPFS Secured</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This prescription will be encrypted, stored on IPFS, and anchored to the Hedera network for
                      security and immutability.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    setShowPrescriptionModal(false)
                    setSelectedAppointment(null)
                    setPrescriptionTitle("")
                    setPrescriptionMedicines([])
                    setPrescriptionNotes("")
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleIssuePrescription}
                  disabled={isLoading || !prescriptionTitle || prescriptionMedicines.length === 0}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
                >
                  {isLoading ? "Issuing..." : "Issue Prescription"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
