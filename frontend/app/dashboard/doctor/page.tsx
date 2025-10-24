"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Calendar,
  CreditCard,
  FileText,
  Activity,
  Brain,
  Database,
  Truck,
  Building2,
  Plus,
  TrendingUp,
  Clock,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import PersonaVault from "@/components/services/persona-vault"
import LifeChain from "@/components/services/lifechain"
import DataBridge from "@/components/services/databridge"
import MedFlow from "@/components/services/medflow"
import CareXPay from "@/components/services/carexpay"
import ClaimSphere from "@/components/services/claimsphere"
import MediTrace from "@/components/services/meditrace"
import HealthIQ from "@/components/services/healthiq"
import GovHealth from "@/components/services/govhealth"
import ImpactGrid from "@/components/services/impactgrid"

const doctorNavigation = [
  {
    name: "PersonaVault™",
    href: "/persona-vault",
    icon: Shield,
    badge: "Verified",
    description: "Manage your medical credentials and license",
  },
  {
    name: "LifeChain™",
    href: "/lifechain",
    icon: FileText,
    badge: "Active",
    description: "Access patient records and add medical notes",
  },
  {
    name: "DataBridge™",
    href: "/databridge",
    icon: Database,
    badge: "Connected",
    description: "Exchange data with hospitals and labs",
  },
  {
    name: "MedFlow™",
    href: "/medflow",
    icon: Calendar,
    badge: "Active",
    description: "Manage appointments and prescriptions",
  },
  {
    name: "CareXPay™",
    href: "/carexpay",
    icon: CreditCard,
    badge: "Active",
    description: "Process payments and track revenue",
  },
  {
    name: "ClaimSphere™",
    href: "/claimsphere",
    icon: Activity,
    badge: "Active",
    description: "Submit insurance claims for patients",
  },
  {
    name: "MediTrace™",
    href: "/meditrace",
    icon: Truck,
    badge: "Active",
    description: "Verify medical supplies and drugs",
  },
  {
    name: "HealthIQ™",
    href: "/healthiq",
    icon: Brain,
    badge: "Active",
    description: "AI insights for patient care",
  },
  {
    name: "GovHealth™",
    href: "/govhealth",
    icon: Building2,
    badge: "Compliant",
    description: "License management and compliance",
  },
  {
    name: "ImpactGrid™",
    href: "/impactgrid",
    icon: TrendingUp,
    badge: "New",
    description: "Join health campaigns and earn rewards",
  },
]

// Stats will be loaded from API
const getDefaultPracticeStats = () => [
  {
    label: "Today's Patients",
    value: "0",
    change: "+0",
    trend: "up",
  },
  {
    label: "This Week",
    value: "0",
    change: "+0",
    trend: "up",
  },
  {
    label: "Revenue (CARE)",
    value: "0",
    change: "+0",
    trend: "up",
  },
  {
    label: "Pending Claims",
    value: "0",
    change: "0",
    trend: "neutral",
  },
]

const upcomingAppointments = [
  {
    time: "2:00 PM",
    patient: "Emma Thompson",
    type: "General Checkup",
    duration: "30 min",
    status: "confirmed",
  },
  {
    time: "2:30 PM",
    patient: "Michael Chen",
    type: "Follow-up",
    duration: "15 min",
    status: "confirmed",
  },
  {
    time: "3:00 PM",
    patient: "Lisa Rodriguez",
    type: "Consultation",
    duration: "45 min",
    status: "pending",
  },
]

export default function DoctorDashboard() {
  const [activeService, setActiveService] = useState<string>("overview")
  const [practiceStats, setPracticeStats] = useState(getDefaultPracticeStats())
  const { user, loading, isAuthenticated, getDisplayName, getTitleByRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth'
      return
    }
    // Check if user has the correct role
    if (!loading && isAuthenticated && user && user.role !== "DOCTOR") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the doctor dashboard.",
        variant: "destructive",
      })
      window.location.href = "/auth"
      return
    }
  }, [loading, isAuthenticated, user, toast])

  if (loading || !isAuthenticated || !user || user.role !== "DOCTOR") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleServiceChange = (serviceName: string) => {
    setActiveService(serviceName)
  }

  const renderServiceContent = () => {
    switch (activeService) {
      case "personavault":
        return <PersonaVault userRole="doctor" />
      case "lifechain":
        return <LifeChain userRole="doctor" />
      case "databridge":
        return <DataBridge userRole="doctor" />
      case "medflow":
        return <MedFlow userRole="doctor" />
      case "carexpay":
        return <CareXPay userRole="doctor" />
      case "claimsphere":
        return <ClaimSphere userRole="doctor" />
      case "meditrace":
        return <MediTrace userRole="doctor" />
      case "healthiq":
        return <HealthIQ userRole="doctor" />
      case "govhealth":
        return <GovHealth userRole="doctor" />
      case "impactgrid":
        return <ImpactGrid userRole="doctor" />
      case "overview":
      default:
        return (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Good afternoon, {getTitleByRole()}!</h1>
              <p className="text-muted-foreground">Here's your practice overview and patient activity</p>
            </div>

            {/* Practice Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {practiceStats.map((stat, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-secondary" />}
                        {stat.trend === "down" && <TrendingUp className="w-4 h-4 text-secondary rotate-180" />}
                        <span
                          className={`text-sm ${
                            stat.trend === "up"
                              ? "text-secondary"
                              : stat.trend === "down"
                                ? "text-secondary"
                                : "text-muted-foreground"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Services Overview */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Service Overview</h2>
                  <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {doctorNavigation.map((service, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card cursor-pointer"
                      onClick={() => {
                        const serviceName = service.name.toLowerCase().replace(/[™\s]/g, "")
                        handleServiceChange(serviceName)
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/20">
                            <service.icon className="w-5 h-5 text-secondary" />
                          </div>
                          <Badge
                            variant={
                              service.badge === "Verified" || service.badge === "Compliant" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {service.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <CardDescription className="text-xs">{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Recently used
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment, index) => (
                      <Card key={index} className="border-border/50 rounded-2xl bg-card">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">{appointment.time}</span>
                            <Badge
                              variant={appointment.status === "confirmed" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{appointment.patient}</p>
                          <p className="text-xs text-muted-foreground">
                            {appointment.type} • {appointment.duration}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("medflow")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("lifechain")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Patient Records
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("claimsphere")}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Submit Claim
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("healthiq")}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      AI Insights
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <DashboardLayout
      userType="doctor"
      userName={getTitleByRole()}
      userTitle="Cardiologist"
      navigation={doctorNavigation}
      activeService={activeService}
      onServiceChange={handleServiceChange}
    >
      {renderServiceContent()}
    </DashboardLayout>
  )
}
