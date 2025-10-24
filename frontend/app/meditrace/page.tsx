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
  Package,
  Heart,
  ArrowLeft,
  Eye,
  Factory,
  Truck,
  CheckCircle,
  QrCode,
  Shield,
  MapPin,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient/Consumer",
    icon: Eye,
    color: "primary",
    steps: [
      "Scan product QR code",
      "Verify medication authenticity",
      "View complete supply chain history",
      "Report counterfeit products",
    ],
    benefits: [
      "Authentic medication guarantee",
      "Complete transparency",
      "Safety assurance",
    ],
  },
  {
    type: "Pharma Company",
    icon: Factory,
    color: "secondary",
    steps: [
      "Register products on blockchain",
      "Generate unique product IDs",
      "Track manufacturing process",
      "Monitor global distribution",
    ],
    benefits: [
      "Brand protection",
      "Supply chain visibility",
      "Counterfeit prevention",
    ],
  },
  {
    type: "Supply Chain Partner",
    icon: Truck,
    color: "accent",
    steps: [
      "Receive products with verification",
      "Update location and custody data",
      "Track shipment conditions",
      "Report quality issues instantly",
    ],
    benefits: [
      "Chain of custody proof",
      "Real-time tracking",
      "Quality assurance",
    ],
  },
];

const features = [
  {
    icon: QrCode,
    title: "QR Code Tracking",
    description:
      "Every product gets a unique blockchain-verified QR code for instant authentication and tracking",
  },
  {
    icon: Shield,
    title: "Anti-Counterfeiting",
    description:
      "Blockchain-based authenticity verification prevents counterfeit medications from entering the supply chain",
  },
  {
    icon: MapPin,
    title: "Real-time Location",
    description:
      "Track products in real-time from manufacturing facilities to patient delivery with GPS integration",
  },
  {
    icon: Package,
    title: "Chain of Custody",
    description:
      "Complete immutable audit trail of every hand that touches your medication throughout the supply chain",
  },
  {
    icon: AlertTriangle,
    title: "Issue Reporting",
    description:
      "Instantly report and track quality issues, recalls, or supply chain problems with blockchain verification",
  },
  {
    icon: Globe,
    title: "Cross-Platform",
    description:
      "Integrate with all MediSphere services and external supply chain management systems",
  },
];

export default function MediTracePage() {
  return (
    <div className="min-h-screen bg-background">
      <style jsx global>{`
        :root {
          --primary: #b8a8d8;
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
                <span className="text-2xl font-bold text-foreground">
                  MediSphere™
                </span>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button
                asChild
                variant="default"
                className="bg-[#b8a8d8] hover:bg-[#b8a8d8]/90 text-white rounded-xl"
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
                <div className="w-16 h-16 bg-[#b8a8d8]/20 rounded-2xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-[#b8a8d8]" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-foreground">
                    MediTrace™
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Supply Chain Transparency
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                End-to-end pharmaceutical supply chain tracking with
                blockchain-verified authenticity, real-time visibility, and
                counterfeit prevention for Africa's healthcare security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#b8a8d8] hover:bg-[#b8a8d8]/90 text-white px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Start Tracking</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#b8a8d8]/20 via-[#b8a8d8]/10 to-[#b8a8d8]/5 rounded-3xl p-8 border border-[#b8a8d8]/20">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b8a8d8]" />
                  <span className="text-foreground font-medium">
                    Blockchain-verified authenticity
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b8a8d8]" />
                  <span className="text-foreground font-medium">
                    Real-time supply chain tracking
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b8a8d8]" />
                  <span className="text-foreground font-medium">
                    Counterfeit prevention
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-[#b8a8d8]" />
                  <span className="text-foreground font-medium">
                    Complete chain of custody
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
              Everything you need to secure and track pharmaceutical supply
              chains
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-[#b8a8d8]/20 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-[#b8a8d8]" />
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
              Your Journey with MediTrace™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Secure supply chain tracking for patients, manufacturers, and
              distributors
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
                          ? "bg-[#b8a8d8]/20"
                          : journey.color === "secondary"
                          ? "bg-secondary/20"
                          : "bg-accent/20"
                      }`}
                    >
                      <journey.icon
                        className={`w-6 h-6 ${
                          journey.color === "primary"
                            ? "text-[#b8a8d8]"
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
                          <div className="w-6 h-6 bg-[#b8a8d8]/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-xs font-medium text-[#b8a8d8]">
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
                          <CheckCircle className="w-4 h-4 mr-2 text-[#b8a8d8] flex-shrink-0" />
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
      <section className="py-20 px-4 bg-gradient-to-r from-[#b8a8d8]/20 via-[#b8a8d8]/10 to-[#b8a8d8]/5">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Secure Your Supply Chain?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the fight against counterfeit medications and ensure authentic
            medicines reach every patient
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#b8a8d8] hover:bg-[#b8a8d8]/90 text-white px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Start Tracking Now</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
