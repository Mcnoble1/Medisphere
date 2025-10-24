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
  Brain,
  Heart,
  ArrowLeft,
  Users,
  Stethoscope,
  Building,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Shield,
  Zap,
  Lock,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient",
    icon: Users,
    color: "primary",
    steps: [
      "Ask health questions in natural language",
      "Get AI-powered insights and recommendations",
      "Track health trends and predictions",
      "Share insights with healthcare providers",
    ],
    benefits: [
      "Personalized health guidance",
      "Early risk detection",
      "Informed health decisions",
    ],
  },
  {
    type: "Healthcare Provider",
    icon: Stethoscope,
    color: "secondary",
    steps: [
      "Access patient AI insights",
      "Review health predictions and trends",
      "Get treatment suggestions",
      "Monitor patient progress with AI",
    ],
    benefits: [
      "Enhanced diagnostic support",
      "Predictive health insights",
      "Improved patient outcomes",
    ],
  },
  {
    type: "Researcher",
    icon: Building,
    color: "accent",
    steps: [
      "Analyze population health patterns",
      "Identify health trends and risks",
      "Generate research insights",
      "Access anonymized health data",
    ],
    benefits: [
      "Population health insights",
      "Research acceleration",
      "Evidence-based discoveries",
    ],
  },
];

const features = [
  {
    icon: Brain,
    title: "AI Health Assistant",
    description:
      "Advanced AI provides personalized health insights and recommendations based on your unique profile",
  },
  {
    icon: MessageCircle,
    title: "Natural Language Chat",
    description:
      "Ask health questions in plain language and receive expert-level answers with explanations",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "AI predicts potential health risks and outcomes based on your data patterns and medical history",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Zero-knowledge architecture ensures your health data remains completely private and secure",
  },
  {
    icon: Zap,
    title: "Real-time Insights",
    description:
      "Get instant health insights as you input new data, symptoms, or health measurements",
  },
  {
    icon: Lock,
    title: "Secure Processing",
    description:
      "All AI processing happens locally or in encrypted environments with blockchain verification",
  },
];

export default function HealthIQPage() {
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
            <div className="flesx gap-2">
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
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    HealthIQ™
                  </h1>
                  <p className="text-muted-foreground">
                    AI-Powered Health Intelligence
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Your personal AI health assistant providing intelligent
                insights, predictive analytics, and personalized recommendations
                while maintaining complete privacy and data security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Start Chatting</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    AI-powered health insights
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Predictive health analytics
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Zero-knowledge privacy
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Natural language interface
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
              Everything you need for intelligent, privacy-first health
              assistance
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
              Your Journey with HealthIQ™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI-powered health intelligence for patients, providers, and
              researchers
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
            Ready for Smarter Healthcare?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of personalized health intelligence with
            complete privacy protection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Start Your AI Journey</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
