"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Calendar,
  CreditCard,
  FileText,
  Activity,
  Brain,
  Database,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import PersonaVault from "@/components/services/persona-vault";
import LifeChain from "@/components/services/lifechain";
import CareXPay from "@/components/services/carexpay";
import ClaimSphere from "@/components/services/claimsphere";
import MedFlow from "@/components/services/medflow";
import HealthIq from "@/components/services/healthiq";
import DataBridge from "@/components/services/databridge";
import MediTrace from "@/components/services/meditrace";
import ImpactGrid from "@/components/services/impactgrid";

const patientNavigation = [
  {
    name: "PersonaVault™",
    href: "/persona-vault",
    icon: Shield,
    badge: "Active",
    description: "Manage your digital identity and credentials",
  },
  {
    name: "LifeChain™",
    href: "/lifechain",
    icon: FileText,
    badge: "Active",
    description: "Access and share your health records",
  },
  {
    name: "DataBridge™",
    href: "/databridge",
    icon: Database,
    badge: "Connected",
    description: "Share data securely with healthcare providers",
  },
  {
    name: "MedFlow™",
    href: "/medflow",
    icon: Calendar,
    badge: "Active",
    description: "Book appointments and manage prescriptions",
  },
  {
    name: "CareXPay™",
    href: "/carexpay",
    icon: CreditCard,
    badge: "Active",
    description: "Manage payments and health tokens",
  },
  {
    name: "ClaimSphere™",
    href: "/claimsphere",
    icon: Activity,
    badge: "Active",
    description: "File and track insurance claims",
  },
  {
    name: "HealthIQ™",
    href: "/healthiq",
    icon: Brain,
    badge: "Active",
    description: "Get AI-powered health insights",
  },
  {
    name: "MediTrace™",
    href: "/meditrace",
    icon: Truck,
    badge: "Active",
    description: "Track and verify medication authenticity",
  },
  {
    name: "ImpactGrid™",
    href: "/impactgrid",
    icon: TrendingUp,
    badge: "New",
    description: "Join health campaigns and earn token rewards",
  },
];

export default function PatientDashboard() {
  const [activeService, setActiveService] = useState<string>("overview");
  const { user, loading, isAuthenticated, getDisplayName, getTitleByRole } =
    useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/auth";
      return;
    }
    // Check if user has the correct role
    if (!loading && isAuthenticated && user && user.role !== "PATIENT") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the patient dashboard.",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }
  }, [loading, isAuthenticated, user, toast]);

  if (loading || !isAuthenticated || !user || user.role !== "PATIENT") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleServiceChange = (serviceName: string) => {
    setActiveService(serviceName);
  };

  const renderServiceContent = () => {
    switch (activeService) {
      case "personavault":
        return <PersonaVault userRole="patient" />;
      case "lifechain":
        return <LifeChain userRole="patient" />;
      case "databridge":
        return <DataBridge userRole="patient" />;
      case "carexpay":
        return <CareXPay userRole="patient" />;
      case "medflow":
        return <MedFlow userRole="patient" />;
      case "healthiq":
        return <HealthIq userRole="patient" />;
      case "claimsphere":
        return <ClaimSphere userRole="patient" />;
      case "meditrace":
        return <MediTrace userRole="patient" />;
      case "impactgrid":
        return <ImpactGrid userRole="patient" />;
      case "overview":
      default:
        return (
          <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Here's your health overview and recent activity
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(() => {
                const healthStats = [
                  {
                    label: "Health Score",
                    value: "85/100",
                    change: "+5",
                    trend: "up",
                  },
                  {
                    label: "Active Records",
                    value: "24",
                    change: "+2",
                    trend: "up",
                  },
                  {
                    label: "CARE Tokens",
                    value: "1,250",
                    change: "+50",
                    trend: "up",
                  },
                  {
                    label: "Appointments",
                    value: "3",
                    change: "0",
                    trend: "neutral",
                  },
                ];

                return healthStats.map((stat, index) => (
                  <Card
                    key={index}
                    className="border-border/50 rounded-2xl bg-card"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {stat.value}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {stat.trend === "up" && (
                            <TrendingUp className="w-4 h-4 text-primary" />
                          )}
                          <span
                            className={`text-sm ${
                              stat.trend === "up"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Service Overview
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-transparent"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {patientNavigation.map((service, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card cursor-pointer"
                      onClick={() => {
                        const serviceName = service.name
                          .toLowerCase()
                          .replace(/[™\s]/g, "");
                        handleServiceChange(serviceName);
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/20">
                            <service.icon className="w-6 h-6 text-primary" />
                          </div>
                          <Badge variant="default" className="text-xs">
                            {service.badge}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          Last used recently
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {(() => {
                    const recentActivity = [
                      {
                        type: "appointment",
                        title: "Appointment with Dr. Sarah Johnson",
                        description: "General checkup scheduled for tomorrow",
                        time: "2 hours ago",
                        status: "upcoming",
                      },
                      {
                        type: "payment",
                        title: "Payment received",
                        description: "50 CARE tokens from wellness program",
                        time: "1 day ago",
                        status: "completed",
                      },
                      {
                        type: "record",
                        title: "Lab results uploaded",
                        description: "Blood test results from City Hospital",
                        time: "3 days ago",
                        status: "completed",
                      },
                      {
                        type: "claim",
                        title: "Insurance claim approved",
                        description:
                          "Claim #CL-2024-001 processed successfully",
                        time: "1 week ago",
                        status: "completed",
                      },
                    ];

                    return recentActivity.map((activity, index) => (
                      <Card
                        key={index}
                        className="border-border/50 rounded-2xl bg-card"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                activity.status === "upcoming"
                                  ? "bg-accent/20"
                                  : activity.status === "completed"
                                  ? "bg-primary/20"
                                  : "bg-muted/20"
                              }`}
                            >
                              {activity.status === "upcoming" ? (
                                <AlertCircle
                                  className={`w-4 h-4 ${
                                    activity.status === "upcoming"
                                      ? "text-accent-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {activity.title}
                              </p>
                              <p className="text-xs text-muted-foreground mb-1">
                                {activity.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ));
                  })()}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("medflow")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("lifechain")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Record
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("claimsphere")}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      File Claim
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl bg-transparent"
                      onClick={() => handleServiceChange("carexpay")}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Payments
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <DashboardLayout
      userType="patient"
      userName={getDisplayName()}
      userTitle={getTitleByRole()}
      navigation={patientNavigation}
      activeService={activeService}
      onServiceChange={handleServiceChange}
    >
      {renderServiceContent()}
    </DashboardLayout>
  );
}
