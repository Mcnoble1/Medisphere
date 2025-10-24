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
  Database,
  Heart,
  ArrowLeft,
  Stethoscope,
  Shield,
  Building2,
  CheckCircle,
  Network,
  Lock,
  FileCheck,
  Globe,
  Zap,
  Eye,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Healthcare Provider",
    icon: Stethoscope,
    color: "primary",
    steps: [
      "Connect to DataBridge network",
      "Request patient data access",
      "Receive consent verification",
      "Access shared health records",
    ],
    benefits: [
      "Complete patient view",
      "Faster diagnosis",
      "Reduced duplicate tests",
    ],
  },
  {
    type: "Government Agency",
    icon: Shield,
    color: "secondary",
    steps: [
      "Register as authorized entity",
      "Request population health data",
      "Receive anonymized insights",
      "Generate public health reports",
    ],
    benefits: [
      "Population health insights",
      "Policy-making data",
      "Epidemic tracking",
    ],
  },
  {
    type: "Research Institution",
    icon: Building2,
    color: "accent",
    steps: [
      "Apply for research access",
      "Get ethics approval",
      "Access anonymized datasets",
      "Conduct health research",
    ],
    benefits: [
      "Large-scale datasets",
      "Accelerated research",
      "Evidence-based studies",
    ],
  },
];

const features = [
  {
    icon: Network,
    title: "Secure Data Exchange",
    description:
      "Seamless, encrypted data sharing between healthcare organizations with blockchain verification",
  },
  {
    icon: Lock,
    title: "Consent Verification",
    description:
      "Automated consent checking ensures only authorized access to patient data",
  },
  {
    icon: FileCheck,
    title: "Audit Trails",
    description:
      "Complete immutable logs of all data access and sharing activities",
  },
  {
    icon: Globe,
    title: "Interoperability",
    description:
      "Works with existing healthcare systems and international data standards",
  },
  {
    icon: Zap,
    title: "Real-Time Processing",
    description: "Instant data validation and sharing with minimal latency",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Full visibility into data usage with patient-controlled access logs",
  },
];

export default function DataBridgePage() {
  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        :root {
          --primary: #b6caeb;
          --primary-foreground: oklch(0.145 0 0);
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-foreground">
                  MediSphere™
                </span>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button
                asChild
                variant="default"
                className="bg-[#b6caeb] hover:bg-[#b6caeb]/90 text-foreground rounded-xl"
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
                <div className="w-16 h-16 bg-[#b6caeb]/20 rounded-2xl flex items-center justify-center">
                  <Database className="w-8 h-8 text-[#b6caeb]" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-foreground">
                    DataBridge™
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Secure Healthcare Data Exchange
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Enable seamless, consent-based data sharing between healthcare
                organizations with blockchain security and complete audit
                trails. Breaking down data silos while protecting patient
                privacy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#b6caeb] hover:bg-[#b6caeb]/90 text-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Connect Your Organization</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#b6caeb]/20 via-[#b6caeb]/10 to-[#b6caeb]/5 rounded-3xl p-8 border border-[#b6caeb]/20">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b6caeb]" />
                  <span className="text-foreground font-medium">
                    Consent-based data sharing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b6caeb]" />
                  <span className="text-foreground font-medium">
                    Blockchain-verified access
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b6caeb]" />
                  <span className="text-foreground font-medium">
                    Complete audit trails
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b6caeb]" />
                  <span className="text-foreground font-medium">
                    Real-time interoperability
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
              Seamless Healthcare Integration
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect healthcare systems securely while maintaining patient
              privacy and regulatory compliance
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-[#b6caeb]/20 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-[#b6caeb]" />
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
              DataBridge™ for Every Organization
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tailored data exchange solutions for healthcare providers,
              government agencies, and research institutions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
                          ? "bg-[#b6caeb]/20"
                          : journey.color === "secondary"
                          ? "bg-secondary/20"
                          : "bg-accent/20"
                      }`}
                    >
                      <journey.icon
                        className={`w-6 h-6 ${
                          journey.color === "primary"
                            ? "text-[#b6caeb]"
                            : journey.color === "secondary"
                            ? "text-secondary"
                            : "text-accent-foreground"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-lg">{journey.type}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 text-foreground">
                      Integration Steps:
                    </h4>
                    <div className="space-y-2">
                      {journey.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <div className="w-6 h-6 bg-[#b6caeb]/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-xs font-medium text-[#b6caeb]">
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
                      Key Benefits:
                    </h4>
                    <div className="space-y-2">
                      {journey.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-[#b6caeb] flex-shrink-0" />
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
      <section className="py-20 px-4 bg-gradient-to-r from-[#b6caeb]/20 via-[#b6caeb]/10 to-[#b6caeb]/5">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Bridge Your Data?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the secure healthcare data exchange network and unlock the
            power of interoperability
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#b6caeb] hover:bg-[#b6caeb]/90 text-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Connect Your Organization</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
