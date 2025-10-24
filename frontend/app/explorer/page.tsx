"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  FileText,
  Users,
  Database,
  Search,
  TrendingUp,
  Shield,
  Clock,
  Hash,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PlatformStats {
  overview: {
    totalRecords: number;
    totalPatients: number;
    totalProviders: number;
    totalTransactions: number;
  };
  recordTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  timelineData: {
    date: string;
    count: number;
  }[];
  topProviders: {
    providerId: string;
    providerName: string;
    recordCount: number;
  }[];
  recentActivity: {
    timestamp: string;
    recordCount: number;
    type: string;
  }[];
  additionalStats?: {
    verifiedRecords: number;
    verificationRate: number;
    totalNFTsMinted: number;
    ipfsFilesTotal: number;
    totalShares: number;
    activeConsents: number;
    activeUsers: number;
    averageIndexingTime: number;
  };
}

interface SearchResult {
  _id: string;
  recordHash: string;
  recordType: string;
  patientId: string;
  providerId: string;
  createdAt: string;
  consensusTimestamp: string;
  topicId: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export default function ExplorerPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<"hash" | "patient" | "provider">(
    "hash"
  );
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Fetch platform statistics on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/explorer/stats`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      let endpoint = "";
      switch (searchType) {
        case "hash":
          endpoint = `/explorer/record/hash/${searchQuery}`;
          break;
        case "patient":
          endpoint = `/explorer/records/patient/${searchQuery}`;
          break;
        case "provider":
          endpoint = `/explorer/records/provider/${searchQuery}`;
          break;
      }

      const response = await axios.get(`${API_URL}${endpoint}`);
      setSearchResults(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading platform statistics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-foreground">
                MediSphere™
              </Link>
              <Badge variant="secondary" className="rounded-full">
                Explorer
              </Badge>
            </div>
            <Button asChild variant="outline">
              <Link href="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Medisphere Health Data Explorer
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Transparent, verifiable, and secure health records on Hedera
          </p>

          {/* Search Interface */}
          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Records
              </CardTitle>
              <CardDescription>
                Search by record hash, patient ID, or provider ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder={
                      searchType === "hash"
                        ? "Enter record hash..."
                        : searchType === "patient"
                        ? "Enter patient Hedera ID (0.0.xxxxx)..."
                        : "Enter provider Hedera ID (0.0.xxxxx)..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="h-12 px-4 rounded-md border border-input bg-background"
                  >
                    <option value="hash">Hash</option>
                    <option value="patient">Patient</option>
                    <option value="provider">Provider</option>
                  </select>
                  <Button
                    onClick={handleSearch}
                    disabled={searching}
                    className="h-12 px-8"
                  >
                    {searching ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-lg">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.map((result) => (
                    <Card key={result._id} className="bg-muted/30">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Record Hash
                            </p>
                            <p className="font-mono text-sm break-all">
                              {result.recordHash}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Record Type
                            </p>
                            <Badge variant="secondary">
                              {result.recordType}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Patient ID
                            </p>
                            <p className="font-mono text-sm">
                              {result.patientId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Provider ID
                            </p>
                            <p className="font-mono text-sm">
                              {result.providerId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Created At
                            </p>
                            <p className="text-sm flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatDate(result.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Topic ID
                            </p>
                            <p className="font-mono text-sm">
                              {result.topicId}
                            </p>
                          </div>
                        </div>
                        {result.metadata && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground mb-2">
                              Metadata
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {result.metadata.tags?.map((tag, idx) => (
                                <Badge key={idx} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            Platform Statistics
          </h2>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatNumber(stats?.overview?.totalRecords || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Anchored on Hedera
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatNumber(stats?.overview?.totalPatients || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Unique patient accounts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Healthcare Providers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatNumber(stats?.overview?.totalProviders || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Verified institutions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-muted/10 to-muted/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatNumber(stats?.overview?.totalTransactions || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  On-chain transactions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Cards */}
          {stats?.additionalStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Verified Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatNumber(stats.additionalStats.verifiedRecords)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.additionalStats.verificationRate.toFixed(2)}% verification rate
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    IPFS Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatNumber(stats.additionalStats.ipfsFilesTotal)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Stored on decentralized storage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    NFTs Minted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatNumber(stats.additionalStats.totalNFTsMinted)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Digital health credentials
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatNumber(stats.additionalStats.activeUsers)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Active in last 30 days
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Active Consents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatNumber(stats.additionalStats.activeConsents)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatNumber(stats.additionalStats.totalShares)} total shares
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Avg. Indexing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {stats.additionalStats.averageIndexingTime}s
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Time to index records
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Analytics */}
          <Tabs defaultValue="types" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
              <TabsTrigger value="types">Record Types</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="providers">Top Providers</TabsTrigger>
            </TabsList>

            {/* Record Types Distribution */}
            <TabsContent value="types">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Record Types Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of health records by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recordTypes?.map((type, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {type.type}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {type.count} ({type.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${type.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Data */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Activity Timeline
                  </CardTitle>
                  <CardDescription>
                    Daily record creation over the last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.timelineData?.slice(0, 10).map((data, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-muted-foreground">
                          {new Date(data.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-secondary h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  (data.count /
                                    Math.max(
                                      ...(stats?.timelineData.map(
                                        (d) => d.count
                                      ) || [1])
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-16 text-sm font-medium text-right">
                          {data.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Providers */}
            <TabsContent value="providers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Healthcare Providers
                  </CardTitle>
                  <CardDescription>
                    Most active providers by record count
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topProviders?.map((provider, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {provider.providerName || "Anonymous Provider"}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {provider.providerId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {formatNumber(provider.recordCount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            records
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!stats?.topProviders ||
                      stats.topProviders.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No provider data available yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recent Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Network Activity
              </CardTitle>
              <CardDescription>
                Latest record anchoring activity on Hedera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentActivity?.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {activity.type} records
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {activity.recordCount} records
                    </Badge>
                  </div>
                ))}
                {(!stats?.recentActivity ||
                  stats.recentActivity.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Join MediSphere?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start securing your health records on the blockchain today
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
