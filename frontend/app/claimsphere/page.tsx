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
  Building2,
  FileText,
  CheckCircle,
  Clock,
  Globe,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient",
    icon: User,
    color: "primary",
    steps: [
      "File insurance claims online",
      "Upload supporting documents",
      "Track claim status in real-time",
      "Receive direct payments to wallet",
    ],
    benefits: [
      "Faster claim processing",
      "Transparent status tracking",
      "Direct digital payments",
    ],
  },
  {
    type: "Healthcare Provider",
    icon: Stethoscope,
    color: "secondary",
    steps: [
      "Submit claims on behalf of patients",
      "Verify insurance coverage instantly",
      "Process pre-authorizations",
      "Receive automated reimbursements",
    ],
    benefits: [
      "Streamlined claim submission",
      "Instant coverage verification",
      "Automated payments",
    ],
  },
  {
    type: "Insurance Company",
    icon: Building2,
    color: "accent",
    steps: [
      "Review claims automatically",
      "Verify medical records on blockchain",
      "Process payments via smart contracts",
      "Generate compliance reports",
    ],
    benefits: [
      "Automated fraud detection",
      "Blockchain verification",
      "Smart contract efficiency",
    ],
  },
];

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "All claims are secured on Hedera blockchain with immutable records and fraud prevention",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    description:
      "Track your claim status from submission to payment with live updates and notifications",
  },
  {
    icon: FileText,
    title: "Smart Contracts",
    description:
      "Automated claim processing using smart contracts for faster, error-free settlements",
  },
  {
    icon: AlertTriangle,
    title: "Fraud Detection",
    description:
      "AI-powered fraud detection with blockchain verification to protect all parties",
  },
  {
    icon: CreditCard,
    title: "Direct Payments",
    description:
      "Receive claim payments directly to your digital wallet with instant settlement",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description:
      "Access your claims across all MediSphere services with unified identity management",
  },
];

export default function ClaimSpherePage() {
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
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    ClaimSphere™
                  </h1>
                  <p className="text-muted-foreground">
                    Transparent Insurance Claims
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transform insurance claims processing with blockchain
                transparency, smart contract automation, and real-time tracking
                for faster, fraud-free settlements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">File Your Claim</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Blockchain-secured claims
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Smart contract automation
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Real-time claim tracking
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Direct digital payments
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
              Everything you need for transparent, efficient insurance claims
              processing
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
              Your Journey with ClaimSphere™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Streamlined claim processing for patients, providers, and insurers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          : "bg-accent/20"
                      }`}
                    >
                      <journey.icon
                        className={`w-6 h-6 ${
                          journey.color === "primary"
                            ? "text-primary"
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
            Ready to Transform Your Claims?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users experiencing faster, transparent insurance
            claims processing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">File Your First Claim</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
