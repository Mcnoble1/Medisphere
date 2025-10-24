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
  Calendar,
  Heart,
  ArrowLeft,
  User,
  Stethoscope,
  CheckCircle,
  Clock,
  Smartphone,
  Bell,
  Star,
  Pill,
} from "lucide-react";
import { Footer } from "@/components/footer";

const userJourneys = [
  {
    type: "Patient",
    icon: User,
    color: "primary",
    steps: [
      "Browse available doctors",
      "Book appointment slots",
      "Receive appointment reminders",
      "Access e-prescriptions",
    ],
    benefits: [
      "Easy scheduling",
      "Reduced wait times",
      "Digital prescriptions",
    ],
  },
  {
    type: "Doctor",
    icon: Stethoscope,
    color: "secondary",
    steps: [
      "Set availability schedule",
      "Manage appointment bookings",
      "Issue digital prescriptions",
      "Track patient appointments",
    ],
    benefits: [
      "Streamlined scheduling",
      "Digital workflow",
      "Better patient management",
    ],
  },
];

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "AI-powered appointment scheduling with real-time availability and automatic conflict resolution",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Automated appointment reminders via SMS, email, and push notifications",
  },
  {
    icon: Star,
    title: "Doctor Profiles",
    description:
      "Comprehensive doctor profiles with ratings, specialties, and patient reviews",
  },
  {
    icon: Pill,
    title: "E-Prescriptions",
    description:
      "Digital prescription management with blockchain verification and pharmacy integration",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description:
      "Optimized mobile experience for booking appointments and managing healthcare on-the-go",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description:
      "Live appointment status updates and instant notifications for schedule changes",
  },
];

export default function MedFlowPage() {
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
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    MedFlow™
                  </h1>
                  <p className="text-muted-foreground">
                    Smart Appointment & Prescription System
                  </p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Streamline healthcare appointments and prescriptions with
                blockchain-verified scheduling, digital prescriptions, and
                seamless patient-doctor communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
                  asChild
                >
                  <Link href="/auth">Book Your First Appointment</Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Real-time appointment booking
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Verified doctor profiles
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Digital prescriptions
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                  <span className="text-foreground font-medium">
                    Automated reminders
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
              Streamlined Healthcare Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need for efficient appointment management and
              prescription handling
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-border/50 rounded-2xl bg-card"
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-accent-foreground" />
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
              Your MedFlow™ Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Seamless workflows for both patients and healthcare providers
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
                          : "bg-secondary/20"
                      }`}
                    >
                      <journey.icon
                        className={`w-6 h-6 ${
                          journey.color === "primary"
                            ? "text-primary"
                            : "text-secondary"
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
                      Your Workflow:
                    </h4>
                    <div className="space-y-2">
                      {journey.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-xs font-medium text-accent-foreground">
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
      <section className="py-16 px-4 bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to Streamline Your Healthcare?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of appointment scheduling and prescription
            management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Start Booking</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
