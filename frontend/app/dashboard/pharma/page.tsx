"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Shield,
  Truck,
  Building2,
  Database,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  MapPin,
  BarChart3,
  QrCode,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import PersonaVault from "@/components/services/persona-vault"
import MediTrace from "@/components/services/meditrace"
import GovHealth from "@/components/services/govhealth"
import DataBridge from "@/components/services/databridge"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

const pharmaNavigation = [
  {
    name: "PersonaVault™",
    href: "/persona-vault",
    icon: Shield,
    badge: "Verified",
    description: "Manage company credentials and verification",
  },
  {
    name: "MediTrace™",
    href: "/meditrace",
    icon: Truck,
    badge: "Active",
    description: "Track products and supply chain integrity",
  },
  {
    name: "GovHealth™",
    href: "/govhealth",
    icon: Building2,
    badge: "Compliant",
    description: "Regulatory compliance and reporting",
  },
  {
    name: "DataBridge™",
    href: "/databridge",
    icon: Database,
    badge: "Connected",
    description: "Exchange data with healthcare partners",
  },
]

const companyStats = [
  {
    label: "Products Registered",
    value: "245",
    change: "+12",
    trend: "up",
  },
  {
    label: "Active Shipments",
    value: "89",
    change: "+15",
    trend: "up",
  },
  {
    label: "Verification Rate",
    value: "99.8%",
    change: "+0.2%",
    trend: "up",
  },
  {
    label: "Compliance Score",
    value: "96%",
    change: "0%",
    trend: "neutral",
  },
]

const activeShipments = [
  {
    id: "SH-2024-1205",
    product: "Amoxicillin 250mg",
    destination: "Lagos General Hospital",
    status: "in-transit",
    progress: 75,
    eta: "Dec 28, 2024",
    temperature: "2-8°C",
  },
  {
    id: "SH-2024-1206",
    product: "Insulin Glargine",
    destination: "Abuja Medical Center",
    status: "delivered",
    progress: 100,
    eta: "Delivered",
    temperature: "2-8°C",
  },
  {
    id: "SH-2024-1207",
    product: "Paracetamol 500mg",
    destination: "Kano State Hospital",
    status: "pending",
    progress: 25,
    eta: "Dec 30, 2024",
    temperature: "15-25°C",
  },
]

const productCategories = [
  {
    name: "Antibiotics",
    count: 45,
    verified: 44,
    alerts: 1,
  },
  {
    name: "Analgesics",
    count: 32,
    verified: 32,
    alerts: 0,
  },
  {
    name: "Vaccines",
    count: 18,
    verified: 18,
    alerts: 0,
  },
  {
    name: "Insulin",
    count: 12,
    verified: 12,
    alerts: 0,
  },
]

const qualityAlerts = [
  {
    batch: "MT-2024-1198",
    product: "Metformin 500mg",
    issue: "Temperature excursion detected",
    severity: "high",
    location: "Kano Warehouse",
    time: "6 hours ago",
  },
  {
    batch: "AB-2024-0567",
    product: "Amoxicillin 250mg",
    issue: "Expiry date approaching",
    severity: "medium",
    location: "Lagos Distribution",
    time: "1 day ago",
  },
  {
    batch: "PR-2024-0890",
    product: "Paracetamol 500mg",
    issue: "Packaging integrity check",
    severity: "low",
    location: "Abuja Facility",
    time: "2 days ago",
  },
]

const recentActivity = [
  {
    type: "shipment",
    title: "Shipment dispatched",
    description: "Batch #MT-2024-1205 - 5,000 units to Lagos",
    time: "2 hours ago",
    status: "in-transit",
    priority: "normal",
  },
  {
    type: "verification",
    title: "Product authenticity verified",
    description: "Paracetamol 500mg - Batch #PR-2024-0890",
    time: "4 hours ago",
    status: "verified",
    priority: "normal",
  },
  {
    type: "alert",
    title: "Temperature deviation detected",
    description: "Cold chain breach in Kano warehouse",
    time: "6 hours ago",
    status: "investigating",
    priority: "high",
  },
]

export default function PharmaDashboard() {
  const [activeService, setActiveService] = useState<string>("overview")
  const { user, loading, isAuthenticated, getDisplayName, getTitleByRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth'
      return
    }
    // Check if user has the correct role
    if (!loading && isAuthenticated && user && user.role !== "PHARMA") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the pharma dashboard.",
        variant: "destructive",
      })
      window.location.href = "/auth"
      return
    }
  }, [loading, isAuthenticated, user, toast])

  if (loading || !isAuthenticated || !user || user.role !== "PHARMA") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleServiceChange = (serviceName: string) => {
    const processedName = serviceName.toLowerCase().replace(/™/g, "").replace(/\s+/g, "")
    setActiveService(processedName)
  }

  const renderServiceContent = () => {
    switch (activeService) {
      case "personavault":
        return <PersonaVault userRole="pharma" />
      case "meditrace":
        return <MediTrace userRole="pharma" />
      case "govhealth":
        return <GovHealth userRole="pharma" />
      case "databridge":
        return <DataBridge userRole="pharma" />
      default:
        return null
    }
  }

  if (activeService && activeService !== "overview") {
    return (
      <DashboardLayout
        userType="pharma"
        userName={getDisplayName()}
        userTitle={getTitleByRole()}
        navigation={pharmaNavigation}
        activeService={activeService}
        onServiceChange={handleServiceChange}
      >
        {renderServiceContent()}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userType="pharma"
      userName={getDisplayName()}
      userTitle={getTitleByRole()}
      navigation={pharmaNavigation}
      activeService={activeService}
      onServiceChange={handleServiceChange}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Supply Chain Dashboard</h1>
        <p className="text-muted-foreground">Monitor product integrity and distribution across Africa</p>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {companyStats.map((stat, index) => (
          <Card key={index} className="border-border/50 rounded-2xl bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-secondary" />}
                  <span
                    className={`text-sm ${
                      stat.trend === "up"
                        ? "text-secondary"
                        : stat.trend === "neutral"
                          ? "text-muted-foreground"
                          : "text-destructive"
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
        {/* Services and Shipments */}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pharmaNavigation.map((service, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card cursor-pointer"
                  onClick={() => handleServiceChange(service.name)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/20">
                        <service.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {service.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm">{service.name}</CardTitle>
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

          {/* Active Shipments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Active Shipments</h2>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                New Shipment
              </Button>
            </div>
            <div className="space-y-4">
              {activeShipments.map((shipment, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{shipment.product}</h3>
                        <p className="text-sm text-muted-foreground">ID: {shipment.id}</p>
                      </div>
                      <Badge
                        variant={
                          shipment.status === "delivered"
                            ? "default"
                            : shipment.status === "in-transit"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <div className="flex items-center text-sm text-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {shipment.destination.split(" ")[0]}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-secondary h-2 rounded-full"
                              style={{ width: `${shipment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">{shipment.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Temperature</p>
                        <p className="text-sm font-medium text-foreground">{shipment.temperature}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ETA</p>
                        <p className="text-sm font-medium text-foreground">{shipment.eta}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Package className="w-3 h-3 mr-1" />
                        Cold chain monitored
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                        Track Shipment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Product Categories</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {productCategories.map((category, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Products</span>
                        <span className="text-sm font-medium text-foreground">{category.count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Verified</span>
                        <span className="text-sm font-medium text-secondary">{category.verified}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Alerts</span>
                        <span
                          className={`text-sm font-medium ${
                            category.alerts > 0 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {category.alerts}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quality Alerts */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quality Alerts</h3>
            <div className="space-y-3">
              {qualityAlerts.map((alert, index) => (
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
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{alert.product}</p>
                    <p className="text-xs text-muted-foreground mb-2">Batch: {alert.batch}</p>
                    <p className="text-xs text-muted-foreground mb-2">{alert.issue}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 mr-1" />
                      {alert.location}
                    </div>
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
                onClick={() => handleServiceChange("MediTrace™")}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Register Product
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("MediTrace™")}
              >
                <Truck className="w-4 h-4 mr-2" />
                Track Shipment
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("GovHealth™")}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("MediTrace™")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Supply Analytics
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
                            : activity.status === "verified" || activity.status === "submitted"
                              ? "bg-secondary/20"
                              : "bg-muted/20"
                        }`}
                      >
                        {activity.priority === "high" ? (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        ) : activity.status === "verified" || activity.status === "submitted" ? (
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
