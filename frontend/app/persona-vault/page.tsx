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
  Shield,
  Heart,
  ArrowLeft,
  User,
  Stethoscope,
  Users,
  Truck,
  CheckCircle,
  Lock,
  Eye,
  Smartphone,
  Globe,
  QrCode,
  FileCheck,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient",
    icon: User,
    color: "primary",
    steps: [
      "Sign up & verify identity",
      "Complete KYC process",
      "Create digital wallet",
      "Share credentials selectively",
    ],
    benefits: ["Control your identity", "Verify with any provider"],
  },
  {
    type: "Doctor",
    icon: Stethoscope,
    color: "secondary",
    steps: [
      "Register medical practice",
      "Link medical license",
      "Verify credentials",
      "Access patient data with consent",
    ],
    benefits: [
      "Verified professional status",
      "Streamlined patient access",
      "Regulatory compliance",
    ],
  },
  {
    type: "NGO",
    icon: Users,
    color: "accent",
    steps: [
      "Register organization",
      "Verify legal status",
      "Create team profiles",
      "Manage program credentials",
    ],
    benefits: [
      "Trusted organization status",
      "Team credential management",
      "Transparent operations",
    ],
  },
  {
    type: "Pharma",
    icon: Truck,
    color: "muted",
    steps: [
      "Register company",
      "Verify business license",
      "Link product certifications",
      "Manage supply chain IDs",
    ],
    benefits: [
      "Verified supplier status",
      "Product authenticity",
      "Supply chain transparency",
    ],
  },
];

const features = [
  {
    icon: Lock,
    title: "Decentralized Identity (DID)",
    description:
      "Your identity is yours alone, stored securely on the blockchain with no central authority",
  },
  {
    icon: FileCheck,
    title: "KYC Verification",
    description:
      "Complete identity verification with government-issued documents and biometric authentication",
  },
  {
    icon: Eye,
    title: "Selective Disclosure",
    description:
      "Share only the information you choose with granular control over your personal data",
  },
  {
    icon: QrCode,
    title: "QR Code Sharing",
    description:
      "Instantly share verified credentials through secure QR codes for quick verification",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description:
      "Access your identity anywhere with our mobile-optimized interface and offline capabilities",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description:
      "Use your PersonaVault identity across all MediSphere services and partner platforms",
  },
];

export default function PersonaVaultPage() {
  return (
    <div className="min-h-screen bg-background">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              >
                <Link href="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    PersonaVault™
                  </h1>
                  <p className="text-muted-foreground">
                    Decentralized Identity Management
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Take complete control of your digital identity with
                blockchain-verified credentials, secure storage, and selective
                sharing capabilities. Your identity, your rules.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Create Your Vault</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Blockchain-verified identity
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Government-grade KYC verification
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Selective data sharing
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Cross-platform compatibility
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to manage your digital identity securely and
              efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
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
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Your Journey with PersonaVault™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Different paths for different users, all leading to secure,
              verified digital identity
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {userJourneys.map((journey, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        journey.color === "primary"
                          ? "bg-primary/20"
                          : journey.color === "secondary"
                          ? "bg-secondary/20"
                          : journey.color === "muted"
                          ? "bg-muted/20"
                          : "bg-accent/20"
                      }`}
                    >
                      <journey.icon
                        className={`w-6 h-6 ${
                          journey.color === "primary"
                            ? "text-primary"
                            : journey.color === "secondary"
                            ? "text-secondary"
                            : journey.color === "muted"
                            ? "text-muted-foreground"
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
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
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
                          <CheckCircle className="w-4 h-4 mr-2 text-secondary flex-shrink-0" />
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
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Own Your Identity?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who have taken control of their digital
            identity with PersonaVault™
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Create Your Vault</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
