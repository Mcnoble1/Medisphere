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
  BarChart3,
  Heart,
  ArrowLeft,
  Target,
  Building,
  Users,
  CheckCircle,
  Shield,
  Globe,
  TrendingUp,
  Eye,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "NGO/Aid Organization",
    icon: Heart,
    color: "primary",
    steps: [
      "Launch health campaigns",
      "Track fund utilization in real-time",
      "Monitor patient outcomes",
      "Generate transparent impact reports",
    ],
    benefits: [
      "Donor trust through transparency",
      "Optimized resource allocation",
      "Measurable impact proof",
    ],
  },
  {
    type: "Government Agency",
    icon: Building,
    color: "secondary",
    steps: [
      "Monitor public health programs",
      "Track resource allocation",
      "Analyze population health trends",
      "Generate policy compliance reports",
    ],
    benefits: [
      "Policy effectiveness measurement",
      "Resource optimization",
      "Public accountability",
    ],
  },
  {
    type: "Donor/Funder",
    icon: Target,
    color: "accent",
    steps: [
      "View campaign progress dashboards",
      "Track fund impact metrics",
      "Verify outcomes with blockchain",
      "Make data-driven funding decisions",
    ],
    benefits: [
      "Investment transparency",
      "Impact verification",
      "Strategic funding decisions",
    ],
  },
];

const features = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Live dashboards showing campaign progress, fund utilization, and health outcomes with instant updates",
  },
  {
    icon: Shield,
    title: "Blockchain Verified",
    description:
      "All impact data is immutably recorded on Hedera blockchain for complete transparency and trust",
  },
  {
    icon: Globe,
    title: "Geographic Mapping",
    description:
      "Visualize health program impact across different regions and communities with interactive maps",
  },
  {
    icon: TrendingUp,
    title: "Predictive Insights",
    description:
      "AI-powered predictions for program success, resource optimization, and outcome forecasting",
  },
  {
    icon: Users,
    title: "Community Impact",
    description:
      "Track how programs affect individual lives and community health with detailed metrics",
  },
  {
    icon: Eye,
    title: "Transparent Reporting",
    description:
      "Generate comprehensive, verifiable reports for stakeholders with blockchain-backed data",
  },
];

export default function ImpactGridPage() {
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
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    ImpactGrid™
                  </h1>
                  <p className="text-muted-foreground">
                    Impact Analytics & Reporting
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Transparent, blockchain-verified analytics for healthcare
                programs, grants, and community impact measurement. Turn data
                into actionable insights for better health outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">View Analytics</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Real-time impact tracking
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Blockchain-verified data
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    AI-powered insights
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Transparent reporting
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
              Everything you need to measure, track, and optimize healthcare
              program impact
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
              Your Journey with ImpactGrid™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transparent impact measurement for organizations, governments, and
              funders
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
            Ready to Measure Your Impact?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join organizations using transparent analytics to demonstrate real
            healthcare improvements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Start Tracking Impact</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
