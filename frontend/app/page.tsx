"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useRef } from "react";
import {
  Shield,
  Heart,
  Calendar,
  CreditCard,
  Users,
  FileText,
  Database,
  Activity,
  Truck,
  CheckCircle,
  Globe,
  Lock,
  Zap,
  Building2,
  ChevronDown,
  Brain,
} from "lucide-react";
import { Footer } from "@/components/footer";

const services = [
  {
    name: "PersonaVault™",
    description:
      "Hedera-based identity for patients, doctors, and organizations",
    icon: Shield,
    color: "primary",
    href: "/persona-vault",
  },
  {
    name: "LifeChain™",
    description: "Secure, consent-based, interoperable health record system",
    icon: FileText,
    color: "secondary",
    href: "/lifechain",
  },
  {
    name: "DataBridge™",
    description: "Secure data exchange between hospitals, labs, insurers",
    icon: Database,
    color: "muted",
    href: "/databridge",
  },
  {
    name: "MedFlow™",
    description: "Decentralized appointment system & e-prescriptions",
    icon: Calendar,
    color: "accent",
    href: "/medflow",
  },
  {
    name: "CareXPay™",
    description: "Token-based payments, grants, insurance, rewards",
    icon: CreditCard,
    color: "primary",
    href: "/carexpay",
  },
  {
    name: "ClaimSphere™",
    description: "Transparent insurance claims and coverage validation",
    icon: Activity,
    color: "secondary",
    href: "/claimsphere",
  },
  {
    name: "MediTrace™",
    description: "Blockchain-based tracking of medical devices, drugs",
    icon: Truck,
    color: "muted",
    href: "/meditrace",
  },
  {
    name: "ImpactGrid™",
    description: "Grant, vaccination, campaign, aid distribution ledger",
    icon: Users,
    color: "accent",
    href: "/impactgrid",
  },
  {
    name: "HealthIQ™",
    description: "Decentralized, privacy-preserving health data analytics",
    icon: Brain,
    color: "primary",
    href: "/healthiq",
  },
  {
    name: "GovHealth™",
    description: "Regulatory compliance, public health reporting, licenses",
    icon: Building2,
    color: "secondary",
    href: "/govhealth",
  },
];

export default function HomePage() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsProductsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProductsOpen(false);
    }, 150); // 150ms delay before closing
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">
                MediSphere™
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/explorer" className="text-muted-foreground hover:text-foreground transition-colors">
                Explorer
              </Link>
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                  <span>Products</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Products Dropdown - Landscape Grid */}
                {isProductsOpen && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[800px] bg-card border border-border rounded-2xl shadow-lg p-6 z-50">
                    <div className="grid grid-cols-2 gap-3">
                      {services.map((service, index) => (
                        <Link
                          key={index}
                          href={service.href}
                          className="flex items-center space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              service.color === "primary"
                                ? "bg-primary/20"
                                : service.color === "secondary"
                                ? "bg-secondary/20"
                                : service.color === "muted"
                                ? "bg-muted/20"
                                : "bg-accent/20"
                            }`}
                          >
                            <service.icon
                              className={`w-5 h-5 ${
                                service.color === "primary"
                                  ? "text-primary"
                                  : service.color === "secondary"
                                  ? "text-secondary"
                                  : service.color === "muted"
                                  ? "text-muted-foreground"
                                  : "text-accent-foreground"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-foreground">
                              {service.name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {service.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <Button
              asChild
              variant="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge
            variant="secondary"
            className="mb-6 bg-secondary text-secondary-foreground border-secondary/30 rounded-full"
          >
            Powered by Hedera Hashgraph
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            MediSphere™
            <span className="text-primary block mt-2">
              The Decentralized Health Ecosystem
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            A trustless, borderless, patient-first healthcare grid for Africa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Join the Revolution</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/explorer">Explore Platform Data</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Core Service Layers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ten integrated services working together to transform healthcare
              delivery across Africa
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card cursor-pointer"
                onClick={() => {
                  window.location.href = service.href;
                }}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                      service.color === "primary"
                        ? "bg-primary/20"
                        : service.color === "secondary"
                        ? "bg-secondary/20"
                        : service.color === "muted"
                        ? "bg-muted/20"
                        : "bg-accent/20"
                    }`}
                  >
                    <service.icon
                      className={`w-6 h-6 ${
                        service.color === "primary"
                          ? "text-primary"
                          : service.color === "secondary"
                          ? "text-secondary"
                          : service.color === "muted"
                          ? "text-muted-foreground"
                          : "text-accent-foreground"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Built for Trust & Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Healthcare data deserves the highest level of protection. That's
              why we chose Hedera.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">
                      Enterprise-Grade Security
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Hedera's hashgraph consensus provides bank-level security
                      with cryptographic proof of every transaction.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">
                      Regulatory Compliance
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Built-in compliance with HIPAA, GDPR, and African
                      healthcare regulations from day one.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">
                      Patient-Owned Data
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Patients maintain complete control over their health data
                      with granular permission controls.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 text-center">
              <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                99.99% Uptime
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Healthcare never stops, and neither do we. Our infrastructure is
                designed for maximum reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Ready to Transform Healthcare?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of healthcare providers and patients already using
            MediSphere™ to deliver better care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl"
              asChild
            >
              <Link href="/auth">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
