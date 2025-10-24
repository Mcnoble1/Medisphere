"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  CreditCard,
  Activity,
  Users,
  Building2,
  Database,
  Truck,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  MapPin,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import GovHealth from "@/components/services/govhealth"
import MediTrace from "@/components/services/meditrace"
import CareXPay from "@/components/services/carexpay"
import ImpactGrid from "@/components/services/impactgrid"
import DataBridge from "@/components/services/databridge"
import ClaimSphere from "@/components/services/claimsphere"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

const governmentNavigation = [
  {
    name: "GovHealth™",
    href: "/govhealth",
    icon: Building2,
    badge: "Active",
    description: "Manage licenses and regulatory compliance",
  },
  {
    name: "MediTrace™",
    href: "/meditrace",
    icon: Truck,
    badge: "Monitoring",
    description: "Monitor medical supply chain integrity",
  },
  {
    name: "CareXPay™",
    href: "/carexpay",
    icon: CreditCard,
    badge: "Active",
    description: "Issue grants and track health spending",
  },
  {
    name: "ImpactGrid™",
    href: "/impactgrid",
    icon: Users,
    badge: "Active",
    description: "Analyze population health impact data",
  },
  {
    name: "DataBridge™",
    href: "/databridge",
    icon: Database,
    badge: "Connected",
    description: "Access aggregated health system data",
  },
  {
    name: "ClaimSphere™",
    href: "/claimsphere",
    icon: Activity,
    badge: "Monitoring",
    description: "Monitor insurance fraud and compliance",
  },
]

const nationalStats = [
  {
    label: "Licensed Providers",
    value: "12,450",
    change: "+125",
    trend: "up",
  },
  {
    label: "Active Facilities",
    value: "3,280",
    change: "+45",
    trend: "up",
  },
  {
    label: "Health Spending",
    value: "₦2.4B",
    change: "+8.5%",
    trend: "up",
  },
  {
    label: "Compliance Rate",
    value: "87%",
    change: "-2%",
    trend: "down",
  },
]

const complianceAlerts = [
  {
    facility: "City Medical Center",
    location: "Lagos",
    issue: "License expiring in 15 days",
    severity: "medium",
    dueDate: "Jan 10, 2025",
  },
  {
    facility: "Rural Health Clinic",
    location: "Kaduna",
    issue: "Missing safety certification",
    severity: "high",
    dueDate: "Overdue",
  },
  {
    facility: "Specialist Hospital",
    location: "Abuja",
    issue: "Equipment inspection required",
    severity: "low",
    dueDate: "Jan 20, 2025",
  },
]

const policyInsights = [
  {
    title: "Maternal Mortality Reduction",
    metric: "15% decrease",
    period: "Last 6 months",
    trend: "positive",
    description: "Rural health programs showing significant impact",
  },
  {
    title: "Vaccination Coverage",
    metric: "78% coverage",
    period: "Current quarter",
    trend: "stable",
    description: "Meeting WHO targets in urban areas",
  },
  {
    title: "Healthcare Access",
    metric: "2.3M new patients",
    period: "This year",
    trend: "positive",
    description: "Digital health initiatives expanding reach",
  },
]

const recentActivity = [
  {
    type: "license",
    title: "Medical license renewed",
    description: "Dr. Adebayo Ogundimu - Lagos State",
    time: "2 hours ago",
    status: "approved",
    priority: "normal",
  },
  {
    type: "audit",
    title: "Facility audit completed",
    description: "General Hospital Kano - Compliance score: 92%",
    time: "4 hours ago",
    status: "completed",
    priority: "normal",
  },
  {
    type: "alert",
    title: "Supply chain anomaly detected",
    description: "Counterfeit drugs flagged in Abuja region",
    time: "6 hours ago",
    status: "investigating",
    priority: "high",
  },
]

export default function GovernmentDashboard() {
  const [activeService, setActiveService] = useState<string>("overview")
  const { user, loading, isAuthenticated, getDisplayName, getTitleByRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth'
      return
    }
    // Check if user has the correct role
    if (!loading && isAuthenticated && user && user.role !== "GOVERNMENT") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the government dashboard.",
        variant: "destructive",
      })
      window.location.href = "/auth"
      return
    }
  }, [loading, isAuthenticated, user, toast])

  if (loading || !isAuthenticated || !user || user.role !== "GOVERNMENT") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleServiceChange = (serviceName: string) => {
    // Process service name to match switch cases
    const processedName = serviceName.toLowerCase().replace(/™/g, "").replace(/\s+/g, "")
    setActiveService(processedName)
  }

  const renderServiceContent = () => {
    switch (activeService) {
      case "govhealth":
        return <GovHealth userRole="government" />
      case "meditrace":
        return <MediTrace userRole="government" />
      case "carexpay":
        return <CareXPay userRole="government" />
      case "impactgrid":
        return <ImpactGrid userRole="government" />
      case "databridge":
        return <DataBridge userRole="government" />
      case "claimsphere":
        return <ClaimSphere userRole="government" />
      default:
        return null
    }
  }

  if (activeService && activeService !== "overview") {
    return (
      <DashboardLayout
        userType="government"
        userName={getDisplayName()}
        userTitle={getTitleByRole()}
        navigation={governmentNavigation}
        activeService={activeService}
        onServiceChange={handleServiceChange}
      >
        {renderServiceContent()}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userType="government"
      userName={getDisplayName()}
      userTitle={getTitleByRole()}
      navigation={governmentNavigation}
      activeService={activeService}
      onServiceChange={handleServiceChange}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">National Health Dashboard</h1>
        <p className="text-muted-foreground">Monitor healthcare system performance and regulatory compliance</p>
      </div>

      {/* National Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {nationalStats.map((stat, index) => (
          <Card key={index} className="border-border/50 rounded-2xl bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-secondary" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-sm ${stat.trend === "up" ? "text-secondary" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Services and Policy Insights */}
        <div className="lg:col-span-3 space-y-8">
          {/* Services Overview */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Service Overview</h2>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {governmentNavigation.map((service, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card cursor-pointer"
                  onClick={() => {
                    handleServiceChange(service.name)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/20">
                        <service.icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
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

          {/* Policy Insights */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Policy Insights</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {policyInsights.map((insight, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">{insight.title}</h3>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          insight.trend === "positive"
                            ? "bg-secondary"
                            : insight.trend === "negative"
                              ? "bg-destructive"
                              : "bg-muted-foreground"
                        }`}
                      ></div>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-2">{insight.metric}</p>
                    <p className="text-sm text-muted-foreground mb-3">{insight.period}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compliance Alerts */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Compliance Alerts</h3>
            <div className="space-y-3">
              {complianceAlerts.map((alert, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          alert.severity === "high"
                            ? "destructive"
                            : alert.severity === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{alert.dueDate}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{alert.facility}</p>
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {alert.location}
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.issue}</p>
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
                onClick={() => handleServiceChange("GovHealth™")}
              >
                <Building2 className="w-4 h-4 mr-2" />
                License Management
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("ImpactGrid™")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("MediTrace™")}
              >
                <Truck className="w-4 h-4 mr-2" />
                Supply Chain Audit
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("CareXPay™")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Issue Grants
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.priority === "high"
                            ? "bg-destructive/20"
                            : activity.status === "completed"
                              ? "bg-secondary/20"
                              : "bg-muted/20"
                        }`}
                      >
                        {activity.priority === "high" ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : activity.status === "completed" ? (
                          <CheckCircle className="w-4 h-4 text-secondary" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
