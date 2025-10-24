"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Building,
  Heart,
  ArrowLeft,
  Shield,
  BarChart3,
  CheckCircle,
  FileCheck,
  Eye,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Government Regulator",
    icon: Building,
    color: "primary",
    steps: [
      "Manage healthcare licenses and certifications",
      "Audit medical facilities and compliance",
      "Monitor regulatory adherence",
      "Generate transparent public reports",
    ],
    benefits: [
      "Streamlined oversight",
      "Transparent governance",
      "Evidence-based policy making",
    ],
  },
  {
    type: "Healthcare Facility",
    icon: Shield,
    color: "secondary",
    steps: [
      "Submit license applications digitally",
      "Upload compliance documents",
      "Track approval status in real-time",
      "Maintain certifications and renewals",
    ],
    benefits: [
      "Simplified licensing process",
      "Real-time status updates",
      "Digital compliance tracking",
    ],
  },
  {
    type: "Public Health Official",
    icon: BarChart3,
    color: "accent",
    steps: [
      "Access population health data",
      "Generate public health reports",
      "Monitor disease surveillance",
      "Track program effectiveness",
    ],
    benefits: [
      "Data-driven insights",
      "Population health monitoring",
      "Evidence-based interventions",
    ],
  },
];

const features = [
  {
    icon: FileCheck,
    title: "License Management",
    description:
      "Streamlined digital licensing process for healthcare facilities and professionals with blockchain verification",
  },
  {
    icon: Shield,
    title: "Compliance Tracking",
    description:
      "Real-time monitoring of regulatory compliance across all facilities with automated alerts and reporting",
  },
  {
    icon: Eye,
    title: "Audit Transparency",
    description:
      "Blockchain-verified audit trails providing complete transparency and immutable compliance records",
  },
  {
    icon: BarChart3,
    title: "Public Health Analytics",
    description:
      "Population health insights, disease surveillance, and program effectiveness tracking with AI analytics",
  },
  {
    icon: AlertTriangle,
    title: "Alert System",
    description:
      "Automated alerts for compliance issues, license renewals, and public health emergencies with instant notifications",
  },
  {
    icon: Globe,
    title: "Cross-Platform Integration",
    description:
      "Seamless integration with all MediSphere services and external government health systems",
  },
];

export default function GovHealthPage() {
  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        :root {
          --primary: #8b9aab;
          --primary-foreground: oklch(1 0 0);
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#8b9aab] rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  MediSphere™
                </span>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button
                asChild
                variant="default"
                className="bg-[#8b9aab] hover:bg-[#8b9aab]/90 text-white rounded-xl"
              >
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-[#8b9aab]/20 rounded-2xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-[#8b9aab]" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-foreground">
                    GovHealth™
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Regulatory Compliance Portal
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Comprehensive regulatory portal for healthcare compliance,
                licensing, and public health oversight. Strengthen governance
                with transparent, blockchain-verified systems across Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#8b9aab] hover:bg-[#8b9aab]/90 text-white px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Access Portal</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#8b9aab]/20 via-[#8b9aab]/10 to-[#8b9aab]/5 rounded-3xl p-8 border border-[#8b9aab]/20">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#8b9aab]" />
                  <span className="text-foreground font-medium">
                    Blockchain-verified compliance
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#8b9aab]" />
                  <span className="text-foreground font-medium">
                    Digital license management
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#8b9aab]" />
                  <span className="text-foreground font-medium">
                    Real-time audit transparency
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#8b9aab]" />
                  <span className="text-foreground font-medium">
                    Public health analytics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need for transparent healthcare governance and
              regulatory compliance
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-[#8b9aab]/20 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-[#8b9aab]" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Journeys Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Your Journey with GovHealth™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transparent governance for regulators, facilities, and public
              health officials
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {userJourneys.map((journey, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        journey.color === "primary"
                          ? "bg-[#8b9aab]/20"
                          : journey.color === "secondary"
                          ? "bg-secondary/20"
                          : "bg-accent/20"
                      }`}
                    >
                      <journey.icon
                        className={`w-6 h-6 ${
                          journey.color === "primary"
                            ? "text-[#8b9aab]"
                            : journey.color === "secondary"
                            ? "text-secondary"
                            : "text-accent-foreground"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-xl">
                      {journey.type} Journey
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 text-foreground">
                      Your Steps:
                    </h4>
                    <div className="space-y-2">
                      {journey.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <div className="w-6 h-6 bg-[#8b9aab]/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-xs font-medium text-[#8b9aab]">
                              {stepIndex + 1}
                            </span>
                          </div>
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-foreground">
                      Your Benefits:
                    </h4>
                    <div className="space-y-2">
                      {journey.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-[#8b9aab] flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#8b9aab]/20 via-[#8b9aab]/10 to-[#8b9aab]/5">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Modernize Healthcare Governance?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join governments using transparent, blockchain-based systems for
            healthcare oversight and compliance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#8b9aab] hover:bg-[#8b9aab]/90 text-white px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Access Portal Now</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
