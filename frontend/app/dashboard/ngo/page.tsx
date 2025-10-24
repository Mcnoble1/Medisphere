"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import {
  Shield,
  CreditCard,
  FileText,
  Users,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  MapPin,
  Calendar,
  BarChart3,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import PersonaVault from "@/components/services/persona-vault"
import LifeChain from "@/components/services/lifechain"
import CareXPay from "@/components/services/carexpay"
import ImpactGrid from "@/components/services/impactgrid"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

const ngoNavigation = [
  {
    name: "PersonaVault™",
    href: "/persona-vault",
    icon: Shield,
    badge: "Verified",
    description: "Manage organization profile and credentials",
  },
  {
    name: "LifeChain™",
    href: "/lifechain",
    icon: FileText,
    badge: "Active",
    description: "Access beneficiary health data for programs",
  },
  {
    name: "CareXPay™",
    href: "/carexpay",
    icon: CreditCard,
    badge: "Active",
    description: "Distribute aid tokens and track utilization",
  },
  {
    name: "ImpactGrid™",
    href: "/impactgrid",
    icon: Users,
    badge: "Active",
    description: "Launch campaigns and measure impact",
  },
]

const organizationStats = [
  {
    label: "Active Campaigns",
    value: "8",
    change: "+2",
    trend: "up",
  },
  {
    label: "Beneficiaries",
    value: "2,450",
    change: "+180",
    trend: "up",
  },
  {
    label: "Funds Distributed",
    value: "$45,200",
    change: "+$8,500",
    trend: "up",
  },
  {
    label: "Impact Score",
    value: "92%",
    change: "+5%",
    trend: "up",
  },
]

const activeCampaigns = [
  {
    name: "Malaria Prevention",
    location: "Kano State",
    progress: 85,
    beneficiaries: 1200,
    budget: "$15,000",
    status: "active",
    endDate: "Dec 31, 2024",
  },
  {
    name: "Maternal Health",
    location: "Lagos State",
    progress: 60,
    beneficiaries: 800,
    budget: "$22,000",
    status: "active",
    endDate: "Jan 15, 2025",
  },
  {
    name: "Child Nutrition",
    location: "Kaduna State",
    progress: 40,
    beneficiaries: 450,
    budget: "$8,200",
    status: "active",
    endDate: "Feb 28, 2025",
  },
]

const upcomingTasks = [
  {
    task: "Submit monthly report to WHO",
    dueDate: "Tomorrow",
    priority: "high",
    campaign: "Malaria Prevention",
  },
  {
    task: "Distribute aid tokens in Abuja",
    dueDate: "Dec 28",
    priority: "medium",
    campaign: "Child Nutrition",
  },
  {
    task: "Conduct impact assessment",
    dueDate: "Dec 30",
    priority: "high",
    campaign: "Maternal Health",
  },
]

const recentActivity = [
  {
    type: "distribution",
    title: "Aid tokens distributed",
    description: "500 CARE tokens to 25 beneficiaries in Lagos",
    time: "2 hours ago",
    status: "completed",
    location: "Lagos, Nigeria",
  },
  {
    type: "campaign",
    title: "Vaccination campaign updated",
    description: "Malaria prevention program - 85% completion",
    time: "4 hours ago",
    status: "active",
    location: "Kano, Nigeria",
  },
  {
    type: "report",
    title: "Impact report generated",
    description: "Q4 2024 maternal health program results",
    time: "1 day ago",
    status: "completed",
    location: "Multiple locations",
  },
]

export default function NGODashboard() {
  const [activeService, setActiveService] = useState<string>("overview")
  const { user, loading, isAuthenticated, getDisplayName, getTitleByRole } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/auth'
      return
    }
    // Check if user has the correct role
    if (!loading && isAuthenticated && user && user.role !== "NGO") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the NGO dashboard.",
        variant: "destructive",
      })
      window.location.href = "/auth"
      return
    }
  }, [loading, isAuthenticated, user, toast])

  if (loading || !isAuthenticated || !user || user.role !== "NGO") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleServiceChange = (serviceName: string) => {
    // Process service name to match switch cases
    const processedName = serviceName.toLowerCase().replace(/™/g, "").replace(/\s+/g, "")
    setActiveService(processedName)
  }

  const renderServiceContent = () => {
    switch (activeService) {
      case "personavault":
        return <PersonaVault userRole="ngo" />
      case "lifechain":
        return <LifeChain userRole="ngo" />
      case "carexpay":
        return <CareXPay userRole="ngo" />
      case "impactgrid":
        return <ImpactGrid userRole="ngo" />
      default:
        return null
    }
  }

  if (activeService && activeService !== "overview") {
    return (
      <DashboardLayout
        userType="ngo"
        userName={getDisplayName()}
        userTitle={getTitleByRole()}
        navigation={ngoNavigation}
        activeService={activeService}
        onServiceChange={handleServiceChange}
      >
        {renderServiceContent()}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userType="ngo"
      userName={getDisplayName()}
      userTitle={getTitleByRole()}
      navigation={ngoNavigation}
      activeService={activeService}
      onServiceChange={handleServiceChange}
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.firstName || getDisplayName()}!</h1>
        <p className="text-muted-foreground">Track your impact and manage humanitarian programs across Africa</p>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {organizationStats.map((stat, index) => (
          <Card key={index} className="border-border/50 rounded-2xl bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-secondary">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Services and Campaigns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Services Overview */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Service Overview</h2>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {ngoNavigation.map((service, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card cursor-pointer"
                  onClick={() => {
                    handleServiceChange(service.name)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/20">
                        <service.icon className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {service.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      Recently used
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Active Campaigns</h2>
              <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
            <div className="space-y-4">
              {activeCampaigns.map((campaign, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {campaign.location}
                        </div>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-secondary h-2 rounded-full"
                              style={{ width: `${campaign.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-foreground">{campaign.progress}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Beneficiaries</p>
                        <p className="text-sm font-medium text-foreground">{campaign.beneficiaries.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="text-sm font-medium text-foreground">{campaign.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        Ends {campaign.endDate}
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl bg-transparent">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <Card key={index} className="border-border/50 rounded-2xl bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="text-xs mb-2">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{task.task}</p>
                    <p className="text-xs text-muted-foreground">{task.campaign}</p>
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
                onClick={() => handleServiceChange("ImpactGrid™")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("CareXPay™")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Distribute Aid
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("ImpactGrid™")}
              >
                <Target className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
                onClick={() => handleServiceChange("LifeChain™")}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
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
                      <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mb-1">{activity.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mr-1" />
                            {activity.location.split(",")[0]}
                          </div>
                        </div>
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
