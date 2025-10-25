"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Heart,
  User,
  Stethoscope,
  Building2,
  Shield,
  Truck,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const userTypes = [
  {
    id: "patient",
    name: "Patient / Individual",
    description:
      "Access your health records, book appointments, manage payments",
    icon: User,
    color: "primary",
  },
  {
    id: "doctor",
    name: "Doctor / Medical Professional",
    description:
      "Manage patient records, issue prescriptions, receive payments",
    icon: Stethoscope,
    color: "secondary",
  },
  {
    id: "ngo",
    name: "NGO / Organization",
    description:
      "Launch campaigns, track impact, disburse aid, report outcomes",
    icon: Building2,
    color: "accent",
  },
  {
    id: "government",
    name: "Government / Regulator",
    description:
      "Manage licenses, audit clinics, view supply chain, generate reports",
    icon: Shield,
    color: "muted",
  },
  {
    id: "pharma",
    name: "Pharma / Supply Chain",
    description:
      "Register products, track shipments, provide authenticity data",
    icon: Truck,
    color: "primary",
  },
];

const serviceUserTypes = {
  "persona-vault": ["patient", "doctor", "ngo", "government", "pharma"],
  lifechain: ["patient", "doctor", "ngo"],
  databridge: ["patient", "doctor", "ngo", "government"],
  medflow: ["patient", "doctor"],
  carexpay: ["patient", "doctor", "ngo"],
  claimsphere: ["patient", "doctor"],
  meditrace: ["pharma", "government", "doctor"],
  impactgrid: ["ngo", "government"],
  healthiq: ["patient", "doctor"],
  govhealth: ["government", "doctor"],
};

export default function AuthPage() {
  const { toast } = useToast();
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [isLogin, setIsLogin] = useState(true);
  const [selectedService, setSelectedService] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    organization: "",
    licenseNumber: "",
    specialty: "",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get("service");
    if (service) {
      setSelectedService(service);
    }

    // Check if user is already logged in and redirect to their dashboard
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          const userRole = user.role.toLowerCase();
          window.location.href = `/dashboard/${userRole}`;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const response = await fetch(
          "https://medisphere-api.up.railway.app/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          toast({
            title: "Login successful!",
            description: "Welcome back to MediSphere™",
            variant: "default",
          });

          // Redirect to appropriate dashboard based on user's actual role
          const userRole = data.user.role.toLowerCase();
          setTimeout(() => {
            window.location.href = `/dashboard/${userRole}`;
          }, 1000);
        } else {
          const error = await response.json();
          toast({
            title: "Login failed",
            description:
              error.message || "Please check your credentials and try again.",
            variant: "destructive",
          });
        }
      } else {
        // Validation for registration
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Password mismatch",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          return;
        }

        if (formData.password.length < 8) {
          toast({
            title: "Password too short",
            description: "Password must be at least 8 characters long.",
            variant: "destructive",
          });
          return;
        }

        // Handle registration
        const response = await fetch(
          "https://medisphere-api.up.railway.app/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              phoneNumber: formData.phone,
              country: formData.country,
              email: formData.email,
              password: formData.password,
              role: selectedUserType.toUpperCase(),
              organization: formData.organization,
              licenseNumber: formData.licenseNumber,
              specialty: formData.specialty,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          toast({
            title: "Account created successfully!",
            description: `Welcome to MediSphere™! Your Hedera account ${
              data.user.hederaAccountId ? `(${data.user.hederaAccountId})` : ""
            } has been created.`,
            variant: "default",
          });

          // Redirect to appropriate dashboard based on user's actual role
          const userRole = data.user.role.toLowerCase();
          setTimeout(() => {
            window.location.href = `/dashboard/${userRole}`;
          }, 2000);
        } else {
          const error = await response.json();
          toast({
            title: "Registration failed",
            description: error.message || "Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Connection error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = userTypes.find((type) => type.id === selectedUserType);

  const availableUserTypes =
    selectedService &&
    serviceUserTypes[selectedService as keyof typeof serviceUserTypes]
      ? userTypes.filter((type) =>
          serviceUserTypes[
            selectedService as keyof typeof serviceUserTypes
          ].includes(type.id)
        )
      : userTypes;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* User Type Selection */}
          {!selectedUserType && (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                Join MediSphere™
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Choose your role to get started with the right experience
              </p>
              {selectedService && (
                <div className="mb-6">
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    For{" "}
                    {selectedService.charAt(0).toUpperCase() +
                      selectedService.slice(1)}{" "}
                    Service
                  </Badge>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableUserTypes.map((type) => (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border/50 rounded-2xl bg-card"
                    onClick={() => setSelectedUserType(type.id)}
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                          type.color === "primary"
                            ? "bg-primary/20"
                            : type.color === "secondary"
                            ? "bg-secondary/20"
                            : type.color === "muted"
                            ? "bg-muted/20"
                            : "bg-accent/20"
                        }`}
                      >
                        <type.icon
                          className={`w-6 h-6 ${
                            type.color === "primary"
                              ? "text-primary"
                              : type.color === "secondary"
                              ? "text-secondary"
                              : type.color === "muted"
                              ? "text-muted-foreground"
                              : "text-accent-foreground"
                          }`}
                        />
                      </div>
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {type.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Form */}
          {selectedUserType && selectedType && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    selectedType.color === "primary"
                      ? "bg-primary/20"
                      : selectedType.color === "secondary"
                      ? "bg-secondary/20"
                      : selectedType.color === "muted"
                      ? "bg-muted/20"
                      : "bg-accent/20"
                  }`}
                >
                  <selectedType.icon
                    className={`w-8 h-8 ${
                      selectedType.color === "primary"
                        ? "text-primary"
                        : selectedType.color === "secondary"
                        ? "text-secondary"
                        : selectedType.color === "muted"
                        ? "text-muted-foreground"
                        : "text-accent-foreground"
                    }`}
                  />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {selectedType.name}
                </h2>
                <p className="text-muted-foreground">
                  {selectedType.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUserType("")}
                  className="mt-2"
                >
                  Change Role
                </Button>
              </div>

              <Card className="rounded-2xl">
                <CardHeader>
                  <Tabs
                    value={isLogin ? "login" : "signup"}
                    onValueChange={(value) => setIsLogin(value === "login")}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) =>
                                handleInputChange("firstName", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) =>
                                handleInputChange("lastName", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        {(selectedUserType === "doctor" ||
                          selectedUserType === "ngo" ||
                          selectedUserType === "pharma") && (
                          <div className="space-y-2">
                            <Label htmlFor="organization">
                              {selectedUserType === "doctor"
                                ? "Medical Practice/Hospital"
                                : selectedUserType === "ngo"
                                ? "Organization Name"
                                : "Company Name"}
                            </Label>
                            <Input
                              id="organization"
                              value={formData.organization}
                              onChange={(e) =>
                                handleInputChange(
                                  "organization",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                        )}

                        {selectedUserType === "doctor" && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="licenseNumber">
                                Medical License Number
                              </Label>
                              <Input
                                id="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={(e) =>
                                  handleInputChange(
                                    "licenseNumber",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="specialty">Specialty</Label>
                              <Select
                                onValueChange={(value) =>
                                  handleInputChange("specialty", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your specialty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    General Practice
                                  </SelectItem>
                                  <SelectItem value="cardiology">
                                    Cardiology
                                  </SelectItem>
                                  <SelectItem value="pediatrics">
                                    Pediatrics
                                  </SelectItem>
                                  <SelectItem value="surgery">
                                    Surgery
                                  </SelectItem>
                                  <SelectItem value="psychiatry">
                                    Psychiatry
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Select
                            onValueChange={(value) =>
                              handleInputChange("country", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nigeria">Nigeria</SelectItem>
                              <SelectItem value="kenya">Kenya</SelectItem>
                              <SelectItem value="ghana">Ghana</SelectItem>
                              <SelectItem value="south-africa">
                                South Africa
                              </SelectItem>
                              <SelectItem value="uganda">Uganda</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                      />
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange("confirmPassword", e.target.value)
                          }
                          required
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isLogin ? "Signing In..." : "Creating Account..."}
                        </>
                      ) : isLogin ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
