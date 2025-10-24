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
  CreditCard,
  Heart,
  ArrowLeft,
  User,
  Stethoscope,
  Users,
  Shield,
  CheckCircle,
  Wallet,
  Zap,
  Gift,
  TrendingUp,
  QrCode,
  Globe,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient",
    icon: User,
    color: "primary",
    steps: [
      "Set up digital wallet",
      "Receive CARE tokens",
      "Pay for healthcare services",
      "Earn wellness rewards",
    ],
    benefits: ["Instant payments", "Reward incentives", "Transparent pricing"],
  },
  {
    type: "Healthcare Provider",
    icon: Stethoscope,
    color: "secondary",
    steps: [
      "Accept token payments",
      "Process insurance claims",
      "Receive instant settlements",
      "Track payment analytics",
    ],
    benefits: ["Faster payments", "Reduced fees", "Automated processing"],
  },
  {
    type: "NGO",
    icon: Users,
    color: "accent",
    steps: [
      "Distribute aid tokens",
      "Track fund utilization",
      "Measure program impact",
      "Generate transparency reports",
    ],
    benefits: [
      "Transparent distribution",
      "Impact tracking",
      "Donor confidence",
    ],
  },
  {
    type: "Government",
    icon: Shield,
    color: "muted",
    steps: [
      "Issue health grants",
      "Monitor fund allocation",
      "Track population health spending",
      "Generate policy insights",
    ],
    benefits: ["Transparent spending", "Policy insights", "Fraud prevention"],
  },
];

const features = [
  {
    icon: Wallet,
    title: "Multi-Token Wallet",
    description:
      "Manage CARE, HEALTH, IMPACT, and INSURE tokens in one secure digital wallet",
  },
  {
    icon: Zap,
    title: "Instant Transactions",
    description:
      "Lightning-fast payments with minimal fees using Hedera Token Service",
  },
  {
    icon: Gift,
    title: "Reward System",
    description:
      "Earn tokens for healthy behaviors, preventive care, and community participation",
  },
  {
    icon: TrendingUp,
    title: "Investment Tracking",
    description:
      "Monitor your health token portfolio and track value appreciation over time",
  },
  {
    icon: QrCode,
    title: "QR Payments",
    description:
      "Quick and secure payments using QR codes for in-person healthcare services",
  },
  {
    icon: Globe,
    title: "Cross-Border",
    description:
      "Send and receive healthcare payments across African borders without traditional banking",
  },
];

export default function CareXPayPage() {
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
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    CareXPay™
                  </h1>
                  <p className="text-muted-foreground">
                    Blockchain Healthcare Payments
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Revolutionary token-based payment system for healthcare
                services, grants, insurance, and rewards. Fast, transparent, and
                accessible to everyone across Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Create Your Wallet</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Instant blockchain payments
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Multi-token support
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Reward incentives
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Cross-border compatibility
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
              Next-Generation Payment Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need for seamless healthcare payments and financial
              management
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
              CareXPay™ for Everyone
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tailored payment solutions for patients, providers, NGOs, and
              government organizations
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
                    <CardTitle className="text-xl">{journey.type}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3 text-foreground">
                      Your Journey:
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
                      Benefits:
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
            Ready to Transform Healthcare Payments?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the blockchain payment revolution and experience instant,
            transparent healthcare transactions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Create Your Wallet</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
