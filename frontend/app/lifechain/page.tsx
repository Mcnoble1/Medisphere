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
  FileText,
  Heart,
  ArrowLeft,
  User,
  Stethoscope,
  Users,
  CheckCircle,
  Shield,
  Clock,
  Share2,
  Lock,
  Baseline as Timeline,
  Upload,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient",
    icon: User,
    color: "primary",
    steps: [
      "Upload health records & test results",
      "Set consent preferences",
      "Share records with providers",
      "Track access history",
    ],
    benefits: [
      "Complete health history",
      "Control data sharing",
      "Portable records",
    ],
  },
  {
    type: "Doctor",
    icon: Stethoscope,
    color: "secondary",
    steps: [
      "Request patient consent",
      "Access patient records",
      "Add medical notes",
      "Update treatment plans",
    ],
    benefits: [
      "Complete patient view",
      "Streamlined documentation",
      "Better care coordination",
    ],
  },
  {
    type: "NGO",
    icon: Users,
    color: "accent",
    steps: [
      "Access aggregated data",
      "Track program impact",
      "Generate health reports",
      "Monitor population health",
    ],
    benefits: [
      "Population insights",
      "Program effectiveness",
      "Evidence-based decisions",
    ],
  },
];

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description:
      "Immutable health records stored securely on Hedera blockchain with cryptographic verification",
  },
  {
    icon: Lock,
    title: "Consent Management",
    description:
      "Granular control over who can access your health data with time-limited permissions",
  },
  {
    icon: Timeline,
    title: "Health Timeline",
    description:
      "Chronological view of your health journey with easy navigation and search capabilities",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    description:
      "Share specific records with healthcare providers through encrypted, consent-based access",
  },
  {
    icon: Upload,
    title: "Multi-Format Support",
    description:
      "Upload lab results, prescriptions, images, and documents in various formats",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description:
      "Instant synchronization across all authorized healthcare providers and systems",
  },
];

export default function LifeChainPage() {
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
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    LifeChain™
                  </h1>
                  <p className="text-muted-foreground">
                    Secure Health Records Management
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Store, manage, and share your health records securely with
                blockchain immutability and granular consent controls. Your
                health data, under your complete control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Start Your LifeChain</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-secondary/10 via-primary/10 to-accent/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Immutable blockchain storage
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Granular consent management
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Multi-provider compatibility
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Complete audit trails
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
              Comprehensive Health Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to manage your health records securely and
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
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-secondary" />
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
              Your LifeChain™ Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Tailored experiences for patients, healthcare providers, and
              organizations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
                          <div className="w-6 h-6 bg-secondary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-xs font-medium text-secondary">
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
      <section className="py-16 px-4 bg-gradient-to-r from-secondary/10 via-primary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Secure Your Health Records?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the future of healthcare with blockchain-secured,
            patient-controlled health records
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Start Your LifeChain</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
